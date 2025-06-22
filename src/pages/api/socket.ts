import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { QueueItem, QueueState, SocketEvents } from "@/types/queue";

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
};

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
      socket.on("queue:add", (name: string, isFastTrack?: boolean) => {
        if (!name || name.trim() === "") {
          socket.emit("queue:error", "Queue name cannot be empty");
          return;
        }

        const newItem: QueueItem = {
          id: generateId(),
          name: name.trim(),
          addedAt: new Date(),
          fastTrack: !!isFastTrack,
        };

        // If fast track, add to the first position or after other fast track items
        if (isFastTrack) {
          // Find the first position where we should insert this fast track item
          // Fast track items should be at the beginning, but maintain their order
          let insertIndex = 0;

          // Find where to insert - after existing fast track items but before regular items
          for (let i = 0; i < queueState.items.length; i++) {
            if (queueState.items[i].fastTrack) {
              insertIndex = i + 1;
            } else {
              break;
            }
          }

          queueState.items.splice(insertIndex, 0, newItem);
          console.log(
            `Added FAST TRACK to queue at position ${insertIndex}: ${newItem.name} (${newItem.id})`,
          );
        } else {
          // Regular add to end of queue
          queueState.items.push(newItem);
          console.log(`Added to queue: ${newItem.name} (${newItem.id})`);
        }

        // Broadcast to all clients
        io.emit("queue:updated", queueState);
        io.emit("queue:item-added", newItem);
      });

      // Handle removing item from queue
      socket.on("queue:remove", (id: string) => {
        const itemIndex = queueState.items.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
          socket.emit("queue:error", "Queue item not found");
          return;
        }

        // Remove item from queue
        const removedItem = queueState.items.splice(itemIndex, 1)[0];

        // Broadcast to all clients
        io.emit("queue:updated", queueState);
        io.emit("queue:item-removed", id);

        console.log(`Removed from queue: ${removedItem.name} (${id})`);
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
