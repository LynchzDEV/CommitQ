import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { QueueItem, QueueState, SocketEvents } from "@/types/queue";
import { getCurrentTeam, subscribeToTeamChanges, Team } from "@/components/TeamSelector";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [queueState, setQueueState] = useState<QueueState>({ items: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team>(getCurrentTeam());

  useEffect(() => {
    const socketInstance = io({
      path: "/api/socket",
    });

    socketInstance.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      setError(null);
      // Join the current team room immediately on connection
      socketInstance.emit("queue:join-team", currentTeam);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    socketInstance.on("queue:updated", (state: QueueState) => {
      setQueueState(state);
    });

    socketInstance.on("queue:error", (message: string) => {
      setError(message);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    socketInstance.on("queue:item-added", (item: QueueItem) => {
      console.log("Item added to queue:", item.name);
    });

    socketInstance.on("queue:item-removed", (id: string) => {
      console.log("Item removed from queue:", id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [currentTeam]);

  const addToQueue = useCallback(
    (name: string, isFastTrack: boolean = false) => {
      if (socket) {
        socket.emit("queue:add", name, currentTeam, isFastTrack);
      }
    },
    [socket, currentTeam],
  );

  const removeFromQueue = useCallback(
    (id: string) => {
      if (socket) {
        socket.emit("queue:remove", id, currentTeam);
      }
    },
    [socket, currentTeam],
  );

  const refreshState = useCallback(() => {
    if (socket) {
      socket.emit("queue:get-state", currentTeam);
    }
  }, [socket, currentTeam]);

  // Handle team changes
  useEffect(() => {
    const unsubscribe = subscribeToTeamChanges((newTeam) => {
      console.log("Team changed in useSocket:", newTeam);
      
      // Leave current team room
      if (socket) {
        socket.emit("queue:leave-team", currentTeam);
        // Join new team room
        socket.emit("queue:join-team", newTeam);
        // Clear current state to avoid showing old team data
        setQueueState({ items: [] });
      }
      
      setCurrentTeam(newTeam);
    });

    return unsubscribe;
  }, [socket, currentTeam]);

  return {
    queueState,
    isConnected,
    error,
    addToQueue,
    removeFromQueue,
    refreshState,
    currentTeam,
  };
};
