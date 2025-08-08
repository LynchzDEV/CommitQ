// src/hooks/useActionItems.ts
import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { ActionItem, ActionItemsState } from "@/types/actionItems";
import { getCurrentTeam, subscribeToTeamChanges, Team } from "@/components/TeamSelector";

export const useActionItems = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [actionItemsState, setActionItemsState] = useState<ActionItemsState>({
    items: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team>(getCurrentTeam());

  useEffect(() => {
    const socketInstance = io({
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server for action items");
      setIsConnected(true);
      setError(null);
      // Join the current team room immediately on connection
      socketInstance.emit("actionItems:join-team", currentTeam);
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
  }, [currentTeam]);

  const addActionItem = useCallback(
    (title: string, description?: string) => {
      if (socket) {
        socket.emit("actionItems:add", title, currentTeam, description);
      }
    },
    [socket, currentTeam],
  );

  const completeActionItem = useCallback(
    (id: string, image?: string, imageName?: string) => {
      if (socket) {
        socket.emit("actionItems:complete", id, currentTeam, image, imageName);
      }
    },
    [socket, currentTeam],
  );

  const uncompleteActionItem = useCallback(
    (id: string) => {
      if (socket) {
        socket.emit("actionItems:uncomplete", id, currentTeam);
      }
    },
    [socket, currentTeam],
  );

  const removeActionItem = useCallback(
    (id: string) => {
      if (socket) {
        socket.emit("actionItems:remove", id, currentTeam);
      }
    },
    [socket, currentTeam],
  );

  const refreshState = useCallback(() => {
    if (socket) {
      socket.emit("actionItems:get-state", currentTeam);
    }
  }, [socket, currentTeam]);

  // Handle team changes
  useEffect(() => {
    const unsubscribe = subscribeToTeamChanges((newTeam) => {
      console.log("Team changed in useActionItems:", newTeam);
      
      // Leave current team room
      if (socket) {
        socket.emit("actionItems:leave-team", currentTeam);
        // Join new team room
        socket.emit("actionItems:join-team", newTeam);
        // Clear current state to avoid showing old team data
        setActionItemsState({ items: [] });
      }
      
      setCurrentTeam(newTeam);
    });

    return unsubscribe;
  }, [socket, currentTeam]);

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
    currentTeam,
  };
};
