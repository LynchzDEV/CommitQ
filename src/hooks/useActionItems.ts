// src/hooks/useActionItems.ts
import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ActionItem, ActionItemsState } from "@/types/actionItems";

export const useActionItems = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [actionItemsState, setActionItemsState] = useState<ActionItemsState>({
    items: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io({
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server for action items");
      setIsConnected(true);
      setError(null);
      // Request current state when connected
      socketInstance.emit("actionItems:get-state");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    // Action Items events
    socketInstance.on("actionItems:updated", (state: ActionItemsState) => {
      setActionItemsState(state);
    });

    socketInstance.on("actionItems:error", (message: string) => {
      setError(message);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    socketInstance.on("actionItems:item-added", (item: ActionItem) => {
      console.log("Action item added:", item.title);
    });

    socketInstance.on("actionItems:item-completed", (id: string) => {
      console.log("Action item completed:", id);
    });

    socketInstance.on("actionItems:item-removed", (id: string) => {
      console.log("Action item removed:", id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const addActionItem = useCallback(
    (title: string, description?: string) => {
      if (socket) {
        socket.emit("actionItems:add", title, description);
      }
    },
    [socket],
  );

  const completeActionItem = useCallback(
    (id: string, image?: string, imageName?: string) => {
      if (socket) {
        socket.emit("actionItems:complete", id, image, imageName);
      }
    },
    [socket],
  );

  const uncompleteActionItem = useCallback(
    (id: string) => {
      if (socket) {
        socket.emit("actionItems:uncomplete", id);
      }
    },
    [socket],
  );

  const removeActionItem = useCallback(
    (id: string) => {
      if (socket) {
        socket.emit("actionItems:remove", id);
      }
    },
    [socket],
  );

  const refreshState = useCallback(() => {
    if (socket) {
      socket.emit("actionItems:get-state");
    }
  }, [socket]);

  // Filter completed and pending items
  const completedItems = actionItemsState.items.filter(
    (item) => item.completed,
  );
  const pendingItems = actionItemsState.items.filter((item) => !item.completed);

  return {
    actionItemsState,
    completedItems,
    pendingItems,
    isConnected,
    error,
    addActionItem,
    completeActionItem,
    uncompleteActionItem,
    removeActionItem,
    refreshState,
  };
};
