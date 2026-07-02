import type { InventoryItem, InventoryStatus } from "./types";

export function deriveInventoryStatus(
  stockQuantity: number,
  minQuantity: number
): InventoryStatus {
  if (stockQuantity <= 0) return "out";
  if (stockQuantity <= minQuantity) return "low";
  return "active";
}

export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  return deriveInventoryStatus(item.stockQuantity, item.minQuantity);
}

export function getInventoryStatusLabel(status: InventoryStatus): string {
  switch (status) {
    case "active":
      return "พร้อมใช้";
    case "low":
      return "ใกล้หมด";
    case "out":
      return "หมด";
    default:
      return status;
  }
}
