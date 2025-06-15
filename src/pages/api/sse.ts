import { NextApiRequest, NextApiResponse } from 'next';
import { QueueItem, QueueState } from '@/types/queue';

// In-memory queue state (in production, use a database)
let queueState: QueueState = {
  items: [],
  currentlyServing: undefined,
};

// Active timers
const activeTimers = new Map<string, { timeoutId: NodeJS.Timeout; startTime: Date; duration: number }>();

// SSE connections
const connections = new Set<NextApiResponse>();

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Broadcast to all SSE connections
const broadcast = (data: any) => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  connections.forEach((res) => {
    try {
      res.write(message);
    } catch (error) {
      connections.delete(res);
    }
  });
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Setup SSE connection
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Add connection to set
    connections.add(res);

    // Send current state immediately
    res.write(`data: ${JSON.stringify({ type: 'queue:updated', data: queueState })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
      connections.delete(res);
    });

    return;
  }

  if (req.method === 'POST') {
    const { action, payload } = req.body;

    switch (action) {
      case 'queue:add':
        {
          const { name } = payload;
          if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Queue name cannot be empty' });
          }

          const newItem: QueueItem = {
            id: generateId(),
            name: name.trim(),
            addedAt: new Date(),
          };

          queueState.items.push(newItem);

          // Broadcast to all connections
          broadcast({ type: 'queue:updated', data: queueState });
          broadcast({ type: 'queue:item-added', data: newItem });

          res.json({ success: true, item: newItem });
        }
        break;

      case 'queue:remove':
        {
          const { id } = payload;
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

          // Broadcast to all connections
          broadcast({ type: 'queue:updated', data: queueState });
          broadcast({ type: 'queue:item-removed', data: { id } });

          res.json({ success: true, removedItem });
        }
        break;

      case 'queue:start-timer':
        {
          const { id, duration } = payload;
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

              broadcast({ type: 'queue:updated', data: queueState });
              broadcast({ type: 'queue:timer-expired', data: { id } });
              broadcast({ type: 'queue:item-removed', data: { id } });
            }
          }, duration);

          // Store timer info
          activeTimers.set(id, {
            timeoutId,
            startTime,
            duration,
          });

          // Update item with timer info
          item.timerStarted = startTime;
          item.timerDuration = duration;

          // Set as currently serving
          queueState.currentlyServing = item;

          // Broadcast to all connections
          broadcast({ type: 'queue:updated', data: queueState });
          broadcast({ type: 'queue:timer-started', data: { id, duration, startTime } });

          res.json({ success: true, timerStarted: true });
        }
        break;

      case 'queue:stop-timer':
        {
          const { id } = payload;
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

          // Broadcast to all connections
          broadcast({ type: 'queue:updated', data: queueState });

          res.json({ success: true, timerStopped: true });
        }
        break;

      default:
        res.status(400).json({ error: 'Unknown action' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
