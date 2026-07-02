/**
 * Local activity log — user-visible history of app changes.
 *
 * @see app/repositories/ActivityLogRepository.ts
 */

export type ActivityEntityType =
  | "import"
  | "backup"
  | "menu"
  | "production"
  | "inventory"
  | "purchase";

export type ActivityType =
  | "import_data"
  | "backup_export"
  | "backup_restore"
  | "menu_create"
  | "menu_edit"
  | "menu_delete"
  | "production_create"
  | "production_edit"
  | "production_delete"
  | "inventory_adjust"
  | "purchase_received";

export type ActivityLog = {
  id: string;
  type: ActivityType;
  message: string;
  entityType: ActivityEntityType;
  entityId: string;
  createdAt: string;
};

export type ActivityLogInput = Omit<ActivityLog, "id" | "createdAt"> & {
  createdAt?: string;
};
