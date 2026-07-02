export type VersionEntityType =
  | "saved_recipe"
  | "saved_menu"
  | "production_plan"
  | "inventory_adjustment";

export type VersionHistory = {
  id: string;
  entityType: VersionEntityType;
  entityId: string;
  snapshot: unknown;
  createdAt: string;
  note: string;
};

export type VersionHistoryInput = {
  entityType: VersionEntityType;
  entityId: string;
  snapshot: unknown;
  note?: string;
};
