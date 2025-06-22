export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  completionImage?: string;
  completionImageName?: string;
}

export interface ActionItemsState {
  items: ActionItem[];
}

export interface ActionItemSocketEvents {
  "actionItems:add": (title: string, description?: string) => void;
  "actionItems:complete": (
    id: string,
    image?: string,
    imageName?: string,
  ) => void;
  "actionItems:uncomplete": (id: string) => void;
  "actionItems:remove": (id: string) => void;
  "actionItems:get-state": () => void;

  "actionItems:updated": (state: ActionItemsState) => void;
  "actionItems:item-added": (item: ActionItem) => void;
  "actionItems:item-completed": (id: string) => void;
  "actionItems:item-removed": (id: string) => void;
  "actionItems:error": (message: string) => void;
}
