export interface QueueItem {
  id: string;
  name: string;
  addedAt: Date;
  fastTrack: boolean;
  team: string;
}

export interface QueueState {
  items: QueueItem[];
}

export interface SocketEvents {
  // Client to Server
  "queue:add": (name: string, team: string, isFastTrack?: boolean) => void;
  "queue:remove": (id: string, team: string) => void;
  "queue:get-state": (team: string) => void;
  "queue:join-team": (team: string) => void;
  "queue:leave-team": (team: string) => void;

  // Server to Client
  "queue:updated": (state: QueueState) => void;
  "queue:item-added": (item: QueueItem) => void;
  "queue:item-removed": (id: string) => void;
  "queue:error": (message: string) => void;
}
