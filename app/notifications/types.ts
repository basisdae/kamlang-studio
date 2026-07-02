export type NotificationType =
  | "inventory_low"
  | "inventory_out"
  | "production_missing"
  | "purchase_incomplete"
  | "backup_reminder";

export type KlNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  href: string;
};
