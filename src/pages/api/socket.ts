import { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { QueueItem, QueueState, SocketEvents } from "@/types/queue";
import { ActionItem, ActionItemsState } from "@/types/actionItems";

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

// In-memory action items state
let actionItemsState: ActionItemsState = {
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
      socket.emit("actionItems:updated", actionItemsState);

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

      // Handle getting action items state
      socket.on("actionItems:get-state", () => {
        socket.emit("actionItems:updated", actionItemsState);
      });

      // Handle adding action item
      socket.on("actionItems:add", (title: string, description?: string) => {
        if (!title || title.trim() === "") {
          socket.emit("actionItems:error", "Action item title cannot be empty");
          return;
        }

        const newItem: ActionItem = {
          id: generateId(),
          title: title.trim(),
          description: description?.trim(),
          completed: false,
          createdAt: new Date(),
        };

        actionItemsState.items.push(newItem);

        // Broadcast to all clients
        io.emit("actionItems:updated", actionItemsState);
        io.emit("actionItems:item-added", newItem);

        console.log(`Added action item: ${newItem.title} (${newItem.id})`);
      });

      // Handle completing action item
      socket.on(
        "actionItems:complete",
        (id: string, image?: string, imageName?: string) => {
          const itemIndex = actionItemsState.items.findIndex(
            (item) => item.id === id,
          );

          if (itemIndex === -1) {
            socket.emit("actionItems:error", "Action item not found");
            return;
          }

          const item = actionItemsState.items[itemIndex];

          // Update item to completed
          actionItemsState.items[itemIndex] = {
            ...item,
            completed: true,
            completedAt: new Date(),
            completionImage: image,
            completionImageName: imageName,
          };

          // Broadcast to all clients
          io.emit("actionItems:updated", actionItemsState);
          io.emit("actionItems:item-completed", id);

          console.log(`Completed action item: ${item.title} (${id})`);
        },
      );

      // Handle uncompleting action item
      socket.on("actionItems:uncomplete", (id: string) => {
        const itemIndex = actionItemsState.items.findIndex(
          (item) => item.id === id,
        );

        if (itemIndex === -1) {
          socket.emit("actionItems:error", "Action item not found");
          return;
        }

        const item = actionItemsState.items[itemIndex];

        // Update item to uncompleted
        actionItemsState.items[itemIndex] = {
          ...item,
          completed: false,
          completedAt: undefined,
          completionImage: undefined,
          completionImageName: undefined,
        };

        // Broadcast to all clients
        io.emit("actionItems:updated", actionItemsState);

        console.log(`Uncompleted action item: ${item.title} (${id})`);
      });

      // Handle removing action item
      socket.on("actionItems:remove", (id: string) => {
        const itemIndex = actionItemsState.items.findIndex(
          (item) => item.id === id,
        );

        if (itemIndex === -1) {
          socket.emit("actionItems:error", "Action item not found");
          return;
        }

        const removedItem = actionItemsState.items.splice(itemIndex, 1)[0];

        // Broadcast to all clients
        io.emit("actionItems:updated", actionItemsState);
        io.emit("actionItems:item-removed", id);

        console.log(`Removed action item: ${removedItem.title} (${id})`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
