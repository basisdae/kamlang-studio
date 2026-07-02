/**
 * Purchase list calculations.
 *
 * Production Rollup → grouped ingredient purchase needs
 *
 * Uses productionRollupService output only.
 * Does not modify Production or any repository.
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import { getEffectivePlanByDate } from "../production/planAccess";
import type { ProductionPlan } from "../production/types";
import type { PurchaseList, PurchaseListLine } from "../purchase/types";
import {
  getProductionRollup,
  getProductionRollupForPlan,
  type ProductionRollup,
} from "./productionRollupService";

function ingredientGroupKey(ingredientId: string, unit: string) {
  return `${ingredientId}::${unit}`;
}

function mapRollupToPurchaseLines(rollup: ProductionRollup): PurchaseListLine[] {
  const lineMap = new Map<string, PurchaseListLine>();

  for (const total of rollup.ingredientTotals) {
    const key = ingredientGroupKey(total.ingredientId, total.unit);
    const existing = lineMap.get(key);

    if (existing) {
      existing.quantityNeeded += total.quantity;
      continue;
    }

    lineMap.set(key, {
      ingredientId: total.ingredientId,
      quantityNeeded: total.quantity,
      unit: total.unit,
    });
  }

  return Array.from(lineMap.values()).sort((a, b) => {
    const nameA = getIngredientById(a.ingredientId)?.name ?? a.ingredientId;
    const nameB = getIngredientById(b.ingredientId)?.name ?? b.ingredientId;

    return nameA.localeCompare(nameB, "th");
  });
}

function buildPurchaseList(rollup: ProductionRollup): PurchaseList {
  return {
    id: `purchase-${rollup.plan.id}`,
    planId: rollup.plan.id,
    planDate: rollup.plan.date,
    lines: mapRollupToPurchaseLines(rollup),
  };
}

export function getPurchaseListFromRollup(rollup: ProductionRollup): PurchaseList {
  return buildPurchaseList(rollup);
}

export function getPurchaseListForPlan(plan: ProductionPlan): PurchaseList {
  return buildPurchaseList(getProductionRollupForPlan(plan));
}

export function getPurchaseListForPlanId(planId: string): PurchaseList {
  return buildPurchaseList(getProductionRollup(planId));
}

export function getPurchaseListForDate(date: string): PurchaseList | null {
  const plan = getEffectivePlanByDate(date);

  if (!plan) {
    return null;
  }

  return getPurchaseListForPlan(plan);
}

export function getGroupedIngredientPurchaseNeeds(
  rollup: ProductionRollup
): PurchaseListLine[] {
  return mapRollupToPurchaseLines(rollup);
}
