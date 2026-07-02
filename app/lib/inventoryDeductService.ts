/**
 * Deduct inventory from production plan ingredient rollup.
 *
 * Uses ProductionRollupService output only.
 * Does not modify Production repository seeds directly.
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import { getEffectiveInventoryByIngredientId } from "../inventory/inventoryAccess";
import type { ProductionRollup } from "./productionRollupService";
import { convertQuantityToStockUnit } from "./inventoryReceiveService";
import {
  getSavedInventoryAdjustment,
  upsertInventoryAdjustment,
} from "../repositories/SavedInventoryRepository";

export type DeductionNeed = {
  ingredientId: string;
  name: string;
  required: number;
  available: number;
  unit: string;
};

export type DeductionShortage = DeductionNeed & {
  shortfall: number;
};

function aggregateDeductionNeeds(
  rollup: ProductionRollup
): Map<string, DeductionNeed> {
  const needs = new Map<string, DeductionNeed>();

  for (const total of rollup.ingredientTotals) {
    const inventory = getEffectiveInventoryByIngredientId(total.ingredientId);
    if (!inventory) continue;

    const ingredient = getIngredientById(total.ingredientId);
    const requiredInStockUnit = convertQuantityToStockUnit(
      inventory.unit,
      total.unit,
      total.quantity
    );

    const existing = needs.get(total.ingredientId);

    if (existing) {
      existing.required += requiredInStockUnit;
      continue;
    }

    needs.set(total.ingredientId, {
      ingredientId: total.ingredientId,
      name: ingredient?.name ?? total.name,
      required: requiredInStockUnit,
      available: inventory.stockQuantity,
      unit: inventory.unit,
    });
  }

  return needs;
}

export function getProductionDeductionNeeds(
  rollup: ProductionRollup
): DeductionNeed[] {
  return Array.from(aggregateDeductionNeeds(rollup).values()).sort((a, b) =>
    a.name.localeCompare(b.name, "th")
  );
}

export function getProductionDeductionShortages(
  rollup: ProductionRollup
): DeductionShortage[] {
  const shortages: DeductionShortage[] = [];

  for (const need of aggregateDeductionNeeds(rollup).values()) {
    const inventory = getEffectiveInventoryByIngredientId(need.ingredientId);
    const available = inventory?.stockQuantity ?? need.available;

    if (available < need.required) {
      shortages.push({
        ...need,
        available,
        shortfall: need.required - available,
      });
    }
  }

  return shortages.sort((a, b) => a.name.localeCompare(b.name, "th"));
}

export function canDeductProductionRollup(rollup: ProductionRollup): boolean {
  return getProductionDeductionShortages(rollup).length === 0;
}

export function applyProductionDeduction(rollup: ProductionRollup): void {
  const shortages = getProductionDeductionShortages(rollup);

  if (shortages.length > 0) {
    throw new Error("Insufficient inventory for production deduction");
  }

  const now = new Date().toISOString();
  const needs = aggregateDeductionNeeds(rollup);

  for (const need of needs.values()) {
    const inventory = getEffectiveInventoryByIngredientId(need.ingredientId);
    if (!inventory) continue;

    const existingAdjustment = getSavedInventoryAdjustment(need.ingredientId);
    const nextStock = inventory.stockQuantity - need.required;

    if (nextStock < 0) {
      throw new Error(
        `Insufficient stock for ingredient "${need.ingredientId}"`
      );
    }

    upsertInventoryAdjustment({
      ingredientId: need.ingredientId,
      stockQuantity: nextStock,
      minQuantity: existingAdjustment?.minQuantity ?? inventory.minQuantity,
      note: existingAdjustment?.note,
      updatedAt: now,
    }, { recordVersion: false });
  }
}
