/**
 * Inventory domain types.
 *
 * Inventory tracks current stock balance per ingredient.
 * Ingredient master data lives in IngredientRepository.
 *
 * @see app/inventory/README.md
 */
import type { IngredientUnit } from "../ingredients/types";

export type InventoryStatus = "active" | "low" | "out";

export type InventoryItem = {
  ingredientId: string;
  stockQuantity: number;
  unit: IngredientUnit;
  minQuantity: number;
  updatedAt: string;
};

export type InventoryItemSeed = InventoryItem;

/** Persisted stock adjustment in LocalStorage. */
export type SavedInventoryAdjustment = {
  ingredientId: string;
  stockQuantity: number;
  minQuantity: number;
  note?: string;
  updatedAt: string;
};
