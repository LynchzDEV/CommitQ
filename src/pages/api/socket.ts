import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { QueueItem, QueueState, SocketEvents, TimerInfo } from "@/types/queue";

// Extend the NextApiResponse to include socket server
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: any & {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
}

// In-memory queue state
let queueState: QueueState = {
  items: [],
  currentlyServing: undefined,
};

// Active timers
const activeTimers = new Map<string, TimerInfo>();

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket,
) {
  if (!res.socket.server.io) {
    console.log("Setting up Socket.IO server...");

    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // Send current state to newly connected client
      socket.emit("queue:updated", queueState);

      // Handle adding item to queue
      socket.on("queue:add", (name: string) => {
        if (!name || name.trim() === "") {
          socket.emit("queue:error", "Queue name cannot be empty");
          return;
        }

        const newItem: QueueItem = {
          id: generateId(),
          name: name.trim(),
          addedAt: new Date(),
        };

        queueState.items.push(newItem);

        // Broadcast to all clients
        io.emit("queue:updated", queueState);
        io.emit("queue:item-added", newItem);

        console.log(`Added to queue: ${newItem.name} (${newItem.id})`);
      });

      // Handle removing item from queue
      socket.on("queue:remove", (id: string) => {
        const itemIndex = queueState.items.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
          socket.emit("queue:error", "Queue item not found");
          return;
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

        // Broadcast to all clients
        io.emit("queue:updated", queueState);
        io.emit("queue:item-removed", id);

        console.log(`Removed from queue: ${removedItem.name} (${id})`);
      });

      // Handle starting timer for first item
      socket.on("queue:start-timer", (id: string, duration: number) => {
        const item = queueState.items.find((item) => item.id === id);

        if (!item) {
          socket.emit("queue:error", "Queue item not found");
          return;
        }

        // Check if item is first in queue
        if (queueState.items[0]?.id !== id) {
          socket.emit(
            "queue:error",
            "Timer can only be started for the first item in queue",
          );
          return;
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
          const itemIndex = queueState.items.findIndex(
            (item) => item.id === id,
          );
          if (itemIndex !== -1) {
            queueState.items.splice(itemIndex, 1);
            activeTimers.delete(id);

            // Clear currently serving if it was this item
            if (queueState.currentlyServing?.id === id) {
              queueState.currentlyServing = undefined;
            }

            io.emit("queue:updated", queueState);
            io.emit("queue:timer-expired", id);
            io.emit("queue:item-removed", id);

            console.log(`Timer expired for: ${item.name} (${id})`);
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

        // Broadcast to all clients
        io.emit("queue:updated", queueState);
        io.emit("queue:timer-started", id, duration, startTime);

        console.log(
          `Timer started for: ${item.name} (${id}) - Duration: ${duration}ms`,
        );
      });

      // Handle stopping timer
      socket.on("queue:stop-timer", (id: string) => {
        if (!activeTimers.has(id)) {
          socket.emit("queue:error", "No active timer found for this item");
          return;
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

        // Broadcast to all clients
        io.emit("queue:updated", queueState);

        console.log(`Timer stopped for item: ${id}`);
      });

      // Handle getting current state
      socket.on("queue:get-state", () => {
        socket.emit("queue:updated", queueState);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
