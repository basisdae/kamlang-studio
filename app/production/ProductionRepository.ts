/**
 * Read-only repository for Production Plans.
 *
 * Data flow:
 *   MenuRepository → ProductionRepository
 *
 * Each plan line references a Menu by menuId (not Recipe).
 *
 * @see app/production/README.md
 */
import { getMenuById } from "../menu/MenuRepository";
import { getProductionPlanSeeds } from "./seed";
import type {
  ProductionLine,
  ProductionPlan,
  ProductionPlanSeed,
} from "./types";

let productionPlanCache: ProductionPlan[] | null = null;

function validateProductionLine(
  line: ProductionLine,
  plan: ProductionPlanSeed
): void {
  if (!line.menuId.trim()) {
    throw new Error(
      `Production plan "${plan.id}" contains an empty menuId`
    );
  }

  if (!getMenuById(line.menuId)) {
    throw new Error(
      `Production plan "${plan.id}" references unknown menu "${line.menuId}"`
    );
  }

  if (!Number.isFinite(line.quantity) || line.quantity <= 0) {
    throw new Error(
      `Production plan "${plan.id}" line for menu "${line.menuId}" must have quantity > 0`
    );
  }
}

function validateProductionPlanSeed(plan: ProductionPlanSeed): void {
  if (!plan.id.trim()) {
    throw new Error("Production plan id must not be empty");
  }

  if (!plan.date.trim()) {
    throw new Error(`Production plan "${plan.id}" must have a date`);
  }

  if (!Array.isArray(plan.lines) || plan.lines.length === 0) {
    throw new Error(
      `Production plan "${plan.id}" must include at least one line`
    );
  }

  const seenMenuIds = new Set<string>();

  for (const line of plan.lines) {
    validateProductionLine(line, plan);

    if (seenMenuIds.has(line.menuId)) {
      throw new Error(
        `Production plan "${plan.id}" references duplicate menu "${line.menuId}"`
      );
    }

    seenMenuIds.add(line.menuId);
  }
}

function loadProductionPlans(): ProductionPlan[] {
  if (!productionPlanCache) {
    const seenIds = new Set<string>();

    productionPlanCache = getProductionPlanSeeds().map((plan) => {
      validateProductionPlanSeed(plan);

      if (seenIds.has(plan.id)) {
        throw new Error(`Duplicate production plan id: "${plan.id}"`);
      }

      seenIds.add(plan.id);

      return {
        ...plan,
        lines: plan.lines.map((line) => ({ ...line })),
      };
    });
  }

  return productionPlanCache;
}

function normalizeDate(date: string): string {
  return date.trim();
}

export function getAllPlans(): ProductionPlan[] {
  return loadProductionPlans();
}

export function getPlanById(id: string): ProductionPlan | undefined {
  return loadProductionPlans().find((plan) => plan.id === id);
}

export function getPlanByDate(date: string): ProductionPlan | undefined {
  const normalized = normalizeDate(date);

  return loadProductionPlans().find((plan) => plan.date === normalized);
}

export function resetProductionPlanCache(): void {
  productionPlanCache = null;
}
