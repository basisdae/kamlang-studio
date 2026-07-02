/**
 * Financial summary from today's production plan and MenuCostService.
 *
 * Uses ProductionPlan, MenuRepository, and menuCostService.
 * Per-portion labour, gas, and electricity come from settings via MenuCostService.
 */
import { getMenuById } from "../menu/MenuRepository";
import { getEffectivePlanByDate } from "../production/planAccess";
import type { ProductionPlan } from "../production/types";
import { calculateMenuCost } from "./menuCostService";

export type FinancialSummary = {
  totalProductionCost: number;
  totalSellingValue: number;
  projectedProfit: number;
  projectedProfitPercent: number;
  labourCostTotal: number;
  gasCostTotal: number;
  electricityCostTotal: number;
};

function getMenuCostForProductionLine(menuId: string) {
  const menu = getMenuById(menuId);

  if (!menu) {
    throw new Error(`Production plan references unknown menu "${menuId}"`);
  }

  return calculateMenuCost({
    recipeId: menu.recipeId,
    packagingSetId: menu.packagingSetId,
    sellingPrice: menu.sellingPrice,
  });
}

export function getFinancialSummaryForPlan(plan: ProductionPlan): FinancialSummary {
  let totalProductionCost = 0;
  let totalSellingValue = 0;
  let labourCostTotal = 0;
  let gasCostTotal = 0;
  let electricityCostTotal = 0;

  for (const line of plan.lines) {
    const menu = getMenuById(line.menuId);

    if (!menu) {
      throw new Error(`Production plan references unknown menu "${line.menuId}"`);
    }

    const cost = getMenuCostForProductionLine(line.menuId);
    const quantity = line.quantity;

    totalProductionCost += cost.totalCost * quantity;
    totalSellingValue += menu.sellingPrice * quantity;
    labourCostTotal += cost.labourCost * quantity;
    gasCostTotal += cost.gasCost * quantity;
    electricityCostTotal += cost.electricityCost * quantity;
  }

  const projectedProfit = totalSellingValue - totalProductionCost;
  const projectedProfitPercent =
    totalSellingValue > 0
      ? Math.round((projectedProfit / totalSellingValue) * 100)
      : 0;

  return {
    totalProductionCost,
    totalSellingValue,
    projectedProfit,
    projectedProfitPercent,
    labourCostTotal,
    gasCostTotal,
    electricityCostTotal,
  };
}

export function getFinancialSummaryForDate(
  date: string
): FinancialSummary | null {
  const plan = getEffectivePlanByDate(date);

  if (!plan) {
    return null;
  }

  return getFinancialSummaryForPlan(plan);
}
