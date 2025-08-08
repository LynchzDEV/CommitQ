export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  completionImage?: string;
  completionImageName?: string;
  team: string;
}

export interface ActionItemsState {
  items: ActionItem[];
}

export interface ActionItemSocketEvents {
  "actionItems:add": (title: string, team: string, description?: string) => void;
  "actionItems:complete": (
    id: string,
    team: string,
    image?: string,
    imageName?: string,
  ) => void;
  "actionItems:uncomplete": (id: string, team: string) => void;
  "actionItems:remove": (id: string, team: string) => void;
  "actionItems:get-state": (team: string) => void;
  "actionItems:join-team": (team: string) => void;
  "actionItems:leave-team": (team: string) => void;

  "actionItems:updated": (state: ActionItemsState) => void;
  "actionItems:item-added": (item: ActionItem) => void;
  "actionItems:item-completed": (id: string) => void;
  "actionItems:item-removed": (id: string) => void;
  "actionItems:error": (message: string) => void;
}
