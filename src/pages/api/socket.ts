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

// In-memory team-separated states
const teamQueueStates: Map<string, QueueState> = new Map();
const teamActionItemsStates: Map<string, ActionItemsState> = new Map();

// Helper function to get or create team queue state
const getTeamQueueState = (team: string): QueueState => {
  if (!teamQueueStates.has(team)) {
    teamQueueStates.set(team, { items: [] });
  }
  return teamQueueStates.get(team)!;
};

// Helper function to get or create team action items state
const getTeamActionItemsState = (team: string): ActionItemsState => {
  if (!teamActionItemsStates.has(team)) {
    teamActionItemsStates.set(team, { items: [] });
  }
  return teamActionItemsStates.get(team)!;
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

      // Handle team joining for queue
      socket.on("queue:join-team", (team: string) => {
        socket.join(`queue:${team}`);
        const teamState = getTeamQueueState(team);
        socket.emit("queue:updated", teamState);
        console.log(`Socket ${socket.id} joined queue team: ${team}`);
      });

      // Handle team leaving for queue
      socket.on("queue:leave-team", (team: string) => {
        socket.leave(`queue:${team}`);
        console.log(`Socket ${socket.id} left queue team: ${team}`);
      });

      // Handle team joining for action items
      socket.on("actionItems:join-team", (team: string) => {
        socket.join(`actionItems:${team}`);
        const teamState = getTeamActionItemsState(team);
        socket.emit("actionItems:updated", teamState);
        console.log(`Socket ${socket.id} joined actionItems team: ${team}`);
      });

      // Handle team leaving for action items
      socket.on("actionItems:leave-team", (team: string) => {
        socket.leave(`actionItems:${team}`);
        console.log(`Socket ${socket.id} left actionItems team: ${team}`);
      });

      // Handle adding item to queue
      socket.on("queue:add", (name: string, team: string, isFastTrack?: boolean) => {
        if (!name || name.trim() === "") {
          socket.emit("queue:error", "Queue name cannot be empty");
          return;
        }

        const teamState = getTeamQueueState(team);
        const newItem: QueueItem = {
          id: generateId(),
          name: name.trim(),
          addedAt: new Date(),
          fastTrack: !!isFastTrack,
          team: team,
        };

        // If fast track, add to the first position or after other fast track items
        if (isFastTrack) {
          // Find the first position where we should insert this fast track item
          // Fast track items should be at the beginning, but maintain their order
          let insertIndex = 0;

          // Find where to insert - after existing fast track items but before regular items
          for (let i = 0; i < teamState.items.length; i++) {
            if (teamState.items[i].fastTrack) {
              insertIndex = i + 1;
            } else {
              break;
            }
          }

          teamState.items.splice(insertIndex, 0, newItem);
          console.log(
            `Added FAST TRACK to queue at position ${insertIndex} for team ${team}: ${newItem.name} (${newItem.id})`,
          );
        } else {
          // Regular add to end of queue
          teamState.items.push(newItem);
          console.log(`Added to queue for team ${team}: ${newItem.name} (${newItem.id})`);
        }

        // Broadcast to team members only
        io.to(`queue:${team}`).emit("queue:updated", teamState);
        io.to(`queue:${team}`).emit("queue:item-added", newItem);
      });

      // Handle removing item from queue
      socket.on("queue:remove", (id: string, team: string) => {
        const teamState = getTeamQueueState(team);
        const itemIndex = teamState.items.findIndex((item) => item.id === id);

        if (itemIndex === -1) {
          socket.emit("queue:error", "Queue item not found");
          return;
        }

        // Remove item from queue
        const removedItem = teamState.items.splice(itemIndex, 1)[0];

        // Broadcast to team members only
        io.to(`queue:${team}`).emit("queue:updated", teamState);
        io.to(`queue:${team}`).emit("queue:item-removed", id);

        console.log(`Removed from queue for team ${team}: ${removedItem.name} (${id})`);
      });

      // Handle getting current state
      socket.on("queue:get-state", (team: string) => {
        const teamState = getTeamQueueState(team);
        socket.emit("queue:updated", teamState);
      });

      // Handle getting action items state
      socket.on("actionItems:get-state", (team: string) => {
        const teamState = getTeamActionItemsState(team);
        socket.emit("actionItems:updated", teamState);
      });

      // Handle adding action item
      socket.on("actionItems:add", (title: string, team: string, description?: string) => {
        if (!title || title.trim() === "") {
          socket.emit("actionItems:error", "Action item title cannot be empty");
          return;
        }

        const teamState = getTeamActionItemsState(team);
        const newItem: ActionItem = {
          id: generateId(),
          title: title.trim(),
          description: description?.trim(),
          completed: false,
          createdAt: new Date(),
          team: team,
        };

        teamState.items.push(newItem);

        // Broadcast to team members only
        io.to(`actionItems:${team}`).emit("actionItems:updated", teamState);
        io.to(`actionItems:${team}`).emit("actionItems:item-added", newItem);

        console.log(`Added action item for team ${team}: ${newItem.title} (${newItem.id})`);
      });

      // Handle completing action item
      socket.on(
        "actionItems:complete",
        (id: string, team: string, image?: string, imageName?: string) => {
          const teamState = getTeamActionItemsState(team);
          const itemIndex = teamState.items.findIndex(
            (item) => item.id === id,
          );

          if (itemIndex === -1) {
            socket.emit("actionItems:error", "Action item not found");
            return;
          }

          const item = teamState.items[itemIndex];

          // Update item to completed
          teamState.items[itemIndex] = {
            ...item,
            completed: true,
            completedAt: new Date(),
            completionImage: image,
            completionImageName: imageName,
          };

          // Broadcast to team members only
          io.to(`actionItems:${team}`).emit("actionItems:updated", teamState);
          io.to(`actionItems:${team}`).emit("actionItems:item-completed", id);

          console.log(`Completed action item for team ${team}: ${item.title} (${id})`);
        },
      );

      // Handle uncompleting action item
      socket.on("actionItems:uncomplete", (id: string, team: string) => {
        const teamState = getTeamActionItemsState(team);
        const itemIndex = teamState.items.findIndex(
          (item) => item.id === id,
        );

        if (itemIndex === -1) {
          socket.emit("actionItems:error", "Action item not found");
          return;
        }

        const item = teamState.items[itemIndex];

        // Update item to uncompleted
        teamState.items[itemIndex] = {
          ...item,
          completed: false,
          completedAt: undefined,
          completionImage: undefined,
          completionImageName: undefined,
        };

        // Broadcast to team members only
        io.to(`actionItems:${team}`).emit("actionItems:updated", teamState);

        console.log(`Uncompleted action item for team ${team}: ${item.title} (${id})`);
      });

      // Handle removing action item
      socket.on("actionItems:remove", (id: string, team: string) => {
        const teamState = getTeamActionItemsState(team);
        const itemIndex = teamState.items.findIndex(
          (item) => item.id === id,
        );

        if (itemIndex === -1) {
          socket.emit("actionItems:error", "Action item not found");
          return;
        }

        const removedItem = teamState.items.splice(itemIndex, 1)[0];

        // Broadcast to team members only
        io.to(`actionItems:${team}`).emit("actionItems:updated", teamState);
        io.to(`actionItems:${team}`).emit("actionItems:item-removed", id);

        console.log(`Removed action item for team ${team}: ${removedItem.title} (${id})`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  res.end();
}
