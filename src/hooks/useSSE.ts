import { useEffect, useState, useCallback, useRef } from 'react';
import { QueueItem, QueueState } from '@/types/queue';

interface SSEEvent {
  type: string;
  data: any;
}

export const useSSE = () => {
  const [queueState, setQueueState] = useState<QueueState>({ items: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/sse');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('SSE Connected');
          setIsConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const eventData: SSEEvent = JSON.parse(event.data);

            switch (eventData.type) {
              case 'queue:updated':
                setQueueState(eventData.data);
                break;
              case 'queue:item-added':
                console.log('Item added to queue:', eventData.data.name);
                break;
              case 'queue:item-removed':
                console.log('Item removed from queue:', eventData.data.id);
                break;
              case 'queue:timer-started':
                console.log(`Timer started for ${eventData.data.id}: ${eventData.data.duration}ms`);
                break;
              case 'queue:timer-expired':
                console.log('Timer expired for:', eventData.data.id);
                break;
              default:
                console.log('Unknown event type:', eventData.type);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        eventSource.onerror = (event) => {
          console.error('SSE Error:', event);
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectSSE();
            }
          }, 3000);
        };

      } catch (error) {
        console.error('Failed to connect SSE:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const makeRequest = useCallback(async (action: string, payload: any) => {
    try {
      const response = await fetch('/api/sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  }, []);

  const addToQueue = useCallback(async (name: string) => {
    return makeRequest('queue:add', { name });
  }, [makeRequest]);

  const removeFromQueue = useCallback(async (id: string) => {
    return makeRequest('queue:remove', { id });
  }, [makeRequest]);

  const startTimer = useCallback(async (id: string, duration: number) => {
    return makeRequest('queue:start-timer', { id, duration });
  }, [makeRequest]);

  const stopTimer = useCallback(async (id: string) => {
    return makeRequest('queue:stop-timer', { id });
  }, [makeRequest]);

  const refreshState = useCallback(() => {
    // SSE automatically sends current state on connect
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      console.log('SSE connection is active, state is up to date');
    } else {
      console.log('SSE connection not active, attempting to reconnect...');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      // Reconnect will happen automatically via useEffect
    }
  }, []);

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
