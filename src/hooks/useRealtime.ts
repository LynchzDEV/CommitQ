import { useEffect, useState, useCallback, useRef } from 'react';
import { QueueItem, QueueState } from '@/types/queue';

export const useRealtime = () => {
  const [queueState, setQueueState] = useState<QueueState>({ items: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const connectToEvents = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/events');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection opened');
      setIsConnected(true);
      clearError();
    };

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'queue:updated':
            setQueueState(message.data);
            break;
          case 'queue:item-added':
            console.log('Item added to queue:', message.data.name);
            break;
          case 'queue:item-removed':
            console.log('Item removed from queue:', message.data.id);
            break;
          case 'queue:timer-started':
            console.log(`Timer started for ${message.data.id}: ${message.data.duration}ms`);
            break;
          case 'queue:timer-expired':
            console.log('Timer expired for:', message.data.id);
            break;
          case 'ping':
            // Keep-alive ping, no action needed
            break;
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (event) => {
      console.error('SSE connection error:', event);
      setIsConnected(false);

      // Attempt to reconnect after 3 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connectToEvents();
      }, 3000);
    };

    return eventSource;
  }, [clearError]);

  useEffect(() => {
    connectToEvents();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectToEvents]);

  const makeApiCall = useCallback(async (action: string, data: any = {}) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API call failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
      throw err;
    }
  }, []);

  const addToQueue = useCallback(async (name: string) => {
    try {
      await makeApiCall('queue:add', { name });
    } catch (err) {
      console.error('Failed to add to queue:', err);
    }
  }, [makeApiCall]);

  const removeFromQueue = useCallback(async (id: string) => {
    try {
      await makeApiCall('queue:remove', { id });
    } catch (err) {
      console.error('Failed to remove from queue:', err);
    }
  }, [makeApiCall]);

  const startTimer = useCallback(async (id: string, duration: number) => {
    try {
      await makeApiCall('queue:start-timer', { id, duration });
    } catch (err) {
      console.error('Failed to start timer:', err);
    }
  }, [makeApiCall]);

  const stopTimer = useCallback(async (id: string) => {
    try {
      await makeApiCall('queue:stop-timer', { id });
    } catch (err) {
      console.error('Failed to stop timer:', err);
    }
  }, [makeApiCall]);

  const refreshState = useCallback(async () => {
    try {
      const result = await makeApiCall('queue:get-state');
      if (result.data) {
        setQueueState(result.data);
      }
    } catch (err) {
      console.error('Failed to refresh state:', err);
    }
  }, [makeApiCall]);

  return {
    queueState,
    isConnected,
    error,
    addToQueue,
    removeFromQueue,
    startTimer,
    stopTimer,
    refreshState,
    clearError,
  };
};
