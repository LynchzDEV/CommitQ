import { NextApiRequest, NextApiResponse } from 'next';
import { QueueItem, QueueState } from '@/types/queue';

// In-memory queue state (will be shared across serverless invocations)
let queueState: QueueState = {
  items: [],
  currentlyServing: undefined,
};

// Active timers storage
const activeTimers = new Map<string, {
  id: string;
  timeoutId: NodeJS.Timeout;
  startTime: Date;
  duration: number;
}>();

// SSE connections storage
const connections = new Map<string, NextApiResponse>();

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Broadcast to all connected clients
const broadcast = (data: any) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  connections.forEach((res, id) => {
    try {
      res.write(message);
    } catch (error) {
      // Remove dead connections
      connections.delete(id);
    }
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // SSE endpoint
    const clientId = generateId();

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Store connection
    connections.set(clientId, res);

    // Send initial state
    res.write(`data: ${JSON.stringify({ type: 'queue:updated', data: queueState })}\n\n`);

    // Cleanup on disconnect
    req.on('close', () => {
      connections.delete(clientId);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      try {
        res.write('data: {"type":"ping"}\n\n');
      } catch (error) {
        clearInterval(keepAlive);
        connections.delete(clientId);
      }
    }, 30000);

    return;
  }

  if (req.method === 'POST') {
    const { action, data } = req.body;

    try {
      switch (action) {
        case 'queue:add': {
          const { name } = data;
          if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Queue name cannot be empty' });
          }

          const newItem: QueueItem = {
            id: generateId(),
            name: name.trim(),
            addedAt: new Date(),
          };

          queueState.items.push(newItem);

          broadcast({
            type: 'queue:updated',
            data: queueState
          });

          broadcast({
            type: 'queue:item-added',
            data: newItem
          });

          return res.json({ success: true, item: newItem });
        }

        case 'queue:remove': {
          const { id } = data;
          const itemIndex = queueState.items.findIndex((item) => item.id === id);

          if (itemIndex === -1) {
            return res.status(404).json({ error: 'Queue item not found' });
          }

          // Clear timer if it exists
          if (activeTimers.has(id)) {
            const timerInfo = activeTimers.get(id)!;
            clearTimeout(timerInfo.timeoutId);
            activeTimers.delete(id);
          }

          // Remove item from queue
          const removedItem = queueState.items.splice(itemIndex, 1)[0];

          // If this was the currently serving item, clear it
          if (queueState.currentlyServing?.id === id) {
            queueState.currentlyServing = undefined;
          }

          broadcast({
            type: 'queue:updated',
            data: queueState
          });

          broadcast({
            type: 'queue:item-removed',
            data: { id }
          });

          return res.json({ success: true });
        }

        case 'queue:start-timer': {
          const { id, duration } = data;
          const item = queueState.items.find((item) => item.id === id);

          if (!item) {
            return res.status(404).json({ error: 'Queue item not found' });
          }

          // Check if item is first in queue
          if (queueState.items[0]?.id !== id) {
            return res.status(400).json({ error: 'Timer can only be started for the first item in queue' });
          }

          // Clear existing timer if any
          if (activeTimers.has(id)) {
            const existingTimer = activeTimers.get(id)!;
            clearTimeout(existingTimer.timeoutId);
          }

          // Set up new timer
          const startTime = new Date();
          const timeoutId = setTimeout(() => {
            // Auto-remove item when timer expires
            const itemIndex = queueState.items.findIndex((item) => item.id === id);
            if (itemIndex !== -1) {
              queueState.items.splice(itemIndex, 1);
              activeTimers.delete(id);

              // Clear currently serving if it was this item
              if (queueState.currentlyServing?.id === id) {
                queueState.currentlyServing = undefined;
              }

              broadcast({
                type: 'queue:updated',
                data: queueState
              });

              broadcast({
                type: 'queue:timer-expired',
                data: { id }
              });
            }
          }, duration);

          // Store timer info
          activeTimers.set(id, {
            id,
            timeoutId,
            startTime,
            duration,
          });

          // Update item with timer info
          item.timerStarted = startTime;
          item.timerDuration = duration;

          // Set as currently serving
          queueState.currentlyServing = item;

          broadcast({
            type: 'queue:updated',
            data: queueState
          });

          broadcast({
            type: 'queue:timer-started',
            data: { id, duration, startTime }
          });

          return res.json({ success: true });
        }

        case 'queue:stop-timer': {
          const { id } = data;
          if (!activeTimers.has(id)) {
            return res.status(404).json({ error: 'No active timer found for this item' });
          }

          const timerInfo = activeTimers.get(id)!;
          clearTimeout(timerInfo.timeoutId);
          activeTimers.delete(id);

          // Update item
          const item = queueState.items.find((item) => item.id === id);
          if (item) {
            item.timerStarted = undefined;
            item.timerDuration = undefined;
          }

          // Clear currently serving if it was this item
          if (queueState.currentlyServing?.id === id) {
            queueState.currentlyServing = undefined;
          }

          broadcast({
            type: 'queue:updated',
            data: queueState
          });

          return res.json({ success: true });
        }

        case 'queue:get-state': {
          return res.json({ success: true, data: queueState });
        }

        default:
          return res.status(400).json({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
