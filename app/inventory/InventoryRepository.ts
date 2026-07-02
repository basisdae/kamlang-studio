/**
 * Read-only repository for Inventory balances.
 *
 * Data flow:
 *   IngredientRepository (master) → InventoryRepository (stock)
 *
 * Each inventory item references an Ingredient by ingredientId.
 *
 * @see app/inventory/README.md
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import { getInventorySeeds } from "./seed";
import type { InventoryItem, InventoryItemSeed } from "./types";
import { getInventoryStatus } from "./utils";

let inventoryCache: InventoryItem[] | null = null;

function validateInventorySeed(seed: InventoryItemSeed): void {
  if (!seed.ingredientId.trim()) {
    throw new Error("Inventory item ingredientId must not be empty");
  }

  if (!getIngredientById(seed.ingredientId)) {
    throw new Error(
      `Inventory references unknown ingredient "${seed.ingredientId}"`
    );
  }

  if (!Number.isFinite(seed.stockQuantity) || seed.stockQuantity < 0) {
    throw new Error(
      `Inventory for ingredient "${seed.ingredientId}" must have stockQuantity >= 0`
    );
  }

  if (!Number.isFinite(seed.minQuantity) || seed.minQuantity < 0) {
    throw new Error(
      `Inventory for ingredient "${seed.ingredientId}" must have minQuantity >= 0`
    );
  }

  if (!seed.unit.trim()) {
    throw new Error(
      `Inventory for ingredient "${seed.ingredientId}" must have a unit`
    );
  }

  if (!seed.updatedAt.trim()) {
    throw new Error(
      `Inventory for ingredient "${seed.ingredientId}" must have updatedAt`
    );
  }
}

function loadInventory(): InventoryItem[] {
  if (!inventoryCache) {
    const seenIngredientIds = new Set<string>();

    inventoryCache = getInventorySeeds().map((seed) => {
      validateInventorySeed(seed);

      if (seenIngredientIds.has(seed.ingredientId)) {
        throw new Error(
          `Duplicate inventory ingredientId: "${seed.ingredientId}"`
        );
      }

      seenIngredientIds.add(seed.ingredientId);

      return { ...seed };
    });
  }

  return inventoryCache;
}

export function getAllInventory(): InventoryItem[] {
  return loadInventory().map((item) => ({ ...item }));
}

export function getInventoryByIngredientId(
  ingredientId: string
): InventoryItem | undefined {
  const item = loadInventory().find(
    (inventoryItem) => inventoryItem.ingredientId === ingredientId
  );

  return item ? { ...item } : undefined;
}

export function getLowStockItems(): InventoryItem[] {
  return getAllInventory().filter(
    (item) => getInventoryStatus(item) === "low"
  );
}

export function getOutOfStockItems(): InventoryItem[] {
  return getAllInventory().filter(
    (item) => getInventoryStatus(item) === "out"
  );
}

export function resetInventoryCache(): void {
  inventoryCache = null;
}
