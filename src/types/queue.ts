export interface QueueItem {
  id: string;
  name: string;
  addedAt: Date;
  timerStarted?: Date;
  timerDuration?: number; // in milliseconds
}

export interface QueueState {
  items: QueueItem[];
  currentlyServing?: QueueItem;
}

export interface SocketEvents {
  // Client to Server
  'queue:add': (name: string) => void;
  'queue:remove': (id: string) => void;
  'queue:start-timer': (id: string, duration: number) => void;
  'queue:stop-timer': (id: string) => void;
  'queue:get-state': () => void;

  // Server to Client
  'queue:updated': (state: QueueState) => void;
  'queue:item-added': (item: QueueItem) => void;
  'queue:item-removed': (id: string) => void;
  'queue:timer-started': (id: string, duration: number, startTime: Date) => void;
  'queue:timer-expired': (id: string) => void;
  'queue:error': (message: string) => void;
}

export type TimerInfo = {
  id: string;
  timeoutId: NodeJS.Timeout;
  startTime: Date;
  duration: number;
};
