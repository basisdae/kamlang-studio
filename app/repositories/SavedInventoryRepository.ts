/**
 * Persisted inventory adjustments in LocalStorage.
 *
 * Overrides seed stock balances from InventoryRepository.
 * Does not modify Ingredient master data.
 */
import type { SavedInventoryAdjustment } from "../inventory/types";
import { addVersion } from "./VersionHistoryRepository";

export const KL_INVENTORY_ADJUSTMENTS_KEY = "kl-inventory-adjustments";

function readAll(): Record<string, SavedInventoryAdjustment> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(KL_INVENTORY_ADJUSTMENTS_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, SavedInventoryAdjustment>;
  } catch {
    return {};
  }
}

function writeAll(adjustments: Record<string, SavedInventoryAdjustment>): void {
  localStorage.setItem(KL_INVENTORY_ADJUSTMENTS_KEY, JSON.stringify(adjustments));
}

export function getSavedInventoryAdjustment(
  ingredientId: string
): SavedInventoryAdjustment | undefined {
  return readAll()[ingredientId];
}

export function getAllSavedInventoryAdjustments(): SavedInventoryAdjustment[] {
  return Object.values(readAll()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function upsertInventoryAdjustment(
  adjustment: SavedInventoryAdjustment,
  options: { recordVersion?: boolean } = {}
): SavedInventoryAdjustment {
  const { recordVersion = true } = options;
  const all = readAll();
  const existing = all[adjustment.ingredientId];

  if (existing && recordVersion) {
    addVersion({
      entityType: "inventory_adjustment",
      entityId: adjustment.ingredientId,
      snapshot: existing,
      note: "ก่อนแก้ไข",
    });
  }

  all[adjustment.ingredientId] = {
    ...adjustment,
    note: adjustment.note?.trim() || undefined,
  };

  writeAll(all);
  return all[adjustment.ingredientId];
}
