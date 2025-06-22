export interface QueueItem {
  id: string;
  name: string;
  addedAt: Date;
  fastTrack: boolean;
}

export interface QueueState {
  items: QueueItem[];
}

export interface SocketEvents {
  // Client to Server
  "queue:add": (name: string) => void;
  "queue:remove": (id: string) => void;
  "queue:get-state": () => void;

  // Server to Client
  "queue:updated": (state: QueueState) => void;
  "queue:item-added": (item: QueueItem) => void;
  "queue:item-removed": (id: string) => void;
  "queue:error": (message: string) => void;
}
