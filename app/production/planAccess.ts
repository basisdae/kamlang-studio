import {
  getSavedProductionPlanById,
  getSavedPlanByDate,
  isProductionDateHidden,
} from "../repositories/SavedProductionRepository";
import {
  getPlanByDate as getSeedPlanByDate,
  getPlanById as getSeedPlanById,
} from "./ProductionRepository";
import type { ProductionPlan } from "./types";
import { normalizeProductionStatus } from "./utils";

function normalizePlan(plan: ProductionPlan): ProductionPlan {
  return {
    ...plan,
    status: normalizeProductionStatus(plan.status),
    lines: plan.lines.map((line) => ({ ...line })),
  };
}

/** Saved plans take priority over read-only seed plans for the same date. */
export function getEffectivePlanByDate(date: string): ProductionPlan | undefined {
  if (isProductionDateHidden(date)) {
    return undefined;
  }

  const saved = getSavedPlanByDate(date);
  if (saved) {
    return normalizePlan(saved);
  }

  const seed = getSeedPlanByDate(date);
  return seed ? normalizePlan(seed) : undefined;
}

export function getEffectivePlanById(id: string): ProductionPlan | undefined {
  const saved = getSavedProductionPlanById(id);
  if (saved) {
    if (isProductionDateHidden(saved.date)) {
      return undefined;
    }

    return normalizePlan(saved);
  }

  const seed = getSeedPlanById(id);
  if (!seed) {
    return undefined;
  }

  if (isProductionDateHidden(seed.date)) {
    return undefined;
  }

  return normalizePlan(seed);
}

export function isSavedProductionPlanForDate(date: string): boolean {
  return Boolean(getSavedPlanByDate(date));
}
