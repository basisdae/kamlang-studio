import { getSavedInventoryAdjustment } from "../repositories/SavedInventoryRepository";
import {
  getAllInventory,
  getInventoryByIngredientId,
} from "./InventoryRepository";
import type { InventoryItem } from "./types";
import { getInventoryStatus } from "./utils";

function applyAdjustment(
  seed: InventoryItem,
  saved?: ReturnType<typeof getSavedInventoryAdjustment>
): InventoryItem {
  if (!saved) {
    return { ...seed };
  }

  return {
    ...seed,
    stockQuantity: saved.stockQuantity,
    minQuantity: saved.minQuantity,
    updatedAt: saved.updatedAt,
  };
}

/** Seed inventory with LocalStorage adjustments applied. */
export function getEffectiveInventoryByIngredientId(
  ingredientId: string
): InventoryItem | undefined {
  const seed = getInventoryByIngredientId(ingredientId);
  if (!seed) return undefined;

  return applyAdjustment(seed, getSavedInventoryAdjustment(ingredientId));
}

export function getEffectiveAllInventory(): InventoryItem[] {
  return getAllInventory().map((seed) =>
    applyAdjustment(seed, getSavedInventoryAdjustment(seed.ingredientId))
  );
}

export function getEffectiveLowStockItems(): InventoryItem[] {
  return getEffectiveAllInventory().filter(
    (item) => getInventoryStatus(item) === "low"
  );
}

export function getEffectiveOutOfStockItems(): InventoryItem[] {
  return getEffectiveAllInventory().filter(
    (item) => getInventoryStatus(item) === "out"
  );
}

export function getSavedNoteForIngredient(ingredientId: string): string | undefined {
  return getSavedInventoryAdjustment(ingredientId)?.note;
}
