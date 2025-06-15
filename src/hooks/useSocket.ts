import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { QueueItem, QueueState, SocketEvents } from '@/types/queue';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [queueState, setQueueState] = useState<QueueState>({ items: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socketInstance.on('queue:updated', (state: QueueState) => {
      setQueueState(state);
    });

    socketInstance.on('queue:error', (message: string) => {
      setError(message);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    socketInstance.on('queue:item-added', (item: QueueItem) => {
      console.log('Item added to queue:', item.name);
    });

    socketInstance.on('queue:item-removed', (id: string) => {
      console.log('Item removed from queue:', id);
    });

    socketInstance.on('queue:timer-started', (id: string, duration: number, startTime: Date) => {
      console.log(`Timer started for ${id}: ${duration}ms`);
    });

    socketInstance.on('queue:timer-expired', (id: string) => {
      console.log('Timer expired for:', id);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const addToQueue = useCallback((name: string) => {
    if (socket) {
      socket.emit('queue:add', name);
    }
  }, [socket]);

  const removeFromQueue = useCallback((id: string) => {
    if (socket) {
      socket.emit('queue:remove', id);
    }
  }, [socket]);

  const startTimer = useCallback((id: string, duration: number) => {
    if (socket) {
      socket.emit('queue:start-timer', id, duration);
    }
  }, [socket]);

  const stopTimer = useCallback((id: string) => {
    if (socket) {
      socket.emit('queue:stop-timer', id);
    }
  }, [socket]);

  const refreshState = useCallback(() => {
    if (socket) {
      socket.emit('queue:get-state');
    }
  }, [socket]);

  return {
    queueState,
    isConnected,
    error,
    addToQueue,
    removeFromQueue,
    startTimer,
    stopTimer,
    refreshState,
  };
};
