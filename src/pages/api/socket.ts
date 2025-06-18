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
