/**
 * Production rollup calculations.
 *
 * Production Plan → Menu × quantity → Recipe ingredients + Packaging sets
 *
 * Uses ProductionRepository, MenuRepository, RecipeRepository,
 * PackagingSetRepository, PackagingItemRepository, and costService.
 * Does not modify any repository.
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import { calcLineCost } from "../ingredients/utils";
import { getEffectiveMenuById } from "../menu/menuAccess";
import { getPackagingItemById } from "../packaging/PackagingItemRepository";
import { getPackagingSetById } from "../packaging/PackagingSetRepository";
import { getEffectivePlanById } from "../production/planAccess";
import type { ProductionPlan } from "../production/types";
import {
  getEffectiveRecipeLines,
  getRecipeCostById,
} from "../recipes/recipeAccess";
import { getPerPortionOverhead } from "../settings/pricingAccess";

export type ProductionMenuLineRollup = {
  menuId: string;
  menuName: string;
  quantity: number;
  note?: string;
  recipeCostPerUnit: number;
  packagingCostPerUnit: number;
  totalCostPerUnit: number;
  recipeCostTotal: number;
  packagingCostTotal: number;
  totalCostTotal: number;
};

export type IngredientTotal = {
  ingredientId: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
};

export type PackagingTotal = {
  packagingItemId: string;
  name: string;
  unit: string;
  quantity: number;
  cost: number;
};

export type ProductionRollup = {
  plan: ProductionPlan;
  menuLines: ProductionMenuLineRollup[];
  ingredientTotals: IngredientTotal[];
  packagingTotals: PackagingTotal[];
  totalRecipeCost: number;
  totalPackagingCost: number;
  totalCost: number;
};

function ingredientTotalKey(ingredientId: string, unit: string) {
  return `${ingredientId}::${unit}`;
}

function getPackagingCostPerUnit(packagingSetId?: string): number {
  if (!packagingSetId) return 0;

  const packagingSet = getPackagingSetById(packagingSetId);

  if (!packagingSet) {
    throw new Error(`Packaging set not found: "${packagingSetId}"`);
  }

  return packagingSet.items.reduce((total, itemId) => {
    const item = getPackagingItemById(itemId);

    if (!item) {
      throw new Error(
        `Packaging set "${packagingSet.name}" (${packagingSet.id}) references unknown item "${itemId}"`
      );
    }

    return total + item.cost;
  }, 0);
}

export function getProductionRollupForPlan(plan: ProductionPlan): ProductionRollup {
  const menuLines: ProductionMenuLineRollup[] = [];
  const ingredientMap = new Map<string, IngredientTotal>();
  const packagingMap = new Map<string, PackagingTotal>();

  let totalRecipeCost = 0;
  let totalPackagingCost = 0;
  let totalOverheadCost = 0;
  const overheadPerUnit = getPerPortionOverhead();

  for (const line of plan.lines) {
    const menu = getEffectiveMenuById(line.menuId);

    if (!menu) {
      throw new Error(
        `Production plan "${plan.id}" references unknown menu "${line.menuId}"`
      );
    }

    const recipe = getEffectiveRecipeLines(menu.recipeId);

    if (!recipe) {
      throw new Error(
        `Menu "${menu.name}" (${menu.id}) references unknown recipe "${menu.recipeId}"`
      );
    }

    if (menu.packagingSetId && !getPackagingSetById(menu.packagingSetId)) {
      throw new Error(
        `Menu "${menu.name}" (${menu.id}) references unknown packaging set "${menu.packagingSetId}"`
      );
    }

    const recipeCostPerUnit = getRecipeCostById(menu.recipeId);
    const packagingCostPerUnit = getPackagingCostPerUnit(menu.packagingSetId);
    const totalCostPerUnit =
      recipeCostPerUnit + packagingCostPerUnit + overheadPerUnit;
    const recipeCostTotal = recipeCostPerUnit * line.quantity;
    const packagingCostTotal = packagingCostPerUnit * line.quantity;
    const overheadCostTotal = overheadPerUnit * line.quantity;
    const totalCostTotal = totalCostPerUnit * line.quantity;

    totalRecipeCost += recipeCostTotal;
    totalPackagingCost += packagingCostTotal;
    totalOverheadCost += overheadCostTotal;

    menuLines.push({
      menuId: menu.id,
      menuName: menu.name,
      quantity: line.quantity,
      note: line.note,
      recipeCostPerUnit,
      packagingCostPerUnit,
      totalCostPerUnit,
      recipeCostTotal,
      packagingCostTotal,
      totalCostTotal,
    });

    for (const recipeLine of recipe.lines) {
      const ingredient = getIngredientById(recipeLine.ingredientId);
      const scaledQuantity = recipeLine.quantity * line.quantity;
      const lineCost = ingredient
        ? calcLineCost(ingredient, scaledQuantity, recipeLine.unit)
        : 0;
      const key = ingredientTotalKey(recipeLine.ingredientId, recipeLine.unit);
      const existing = ingredientMap.get(key);

      if (existing) {
        existing.quantity += scaledQuantity;
        existing.cost += lineCost;
        continue;
      }

      ingredientMap.set(key, {
        ingredientId: recipeLine.ingredientId,
        name: ingredient?.name ?? "ไม่พบวัตถุดิบ",
        unit: recipeLine.unit,
        quantity: scaledQuantity,
        cost: lineCost,
      });
    }

    if (menu.packagingSetId) {
      const packagingSet = getPackagingSetById(menu.packagingSetId)!;

      for (const itemId of packagingSet.items) {
        const item = getPackagingItemById(itemId);

        if (!item) {
          throw new Error(
            `Packaging set "${packagingSet.name}" (${packagingSet.id}) references unknown item "${itemId}"`
          );
        }

        const scaledQuantity = line.quantity;
        const lineCost = item.cost * scaledQuantity;
        const existing = packagingMap.get(itemId);

        if (existing) {
          existing.quantity += scaledQuantity;
          existing.cost += lineCost;
          continue;
        }

        packagingMap.set(itemId, {
          packagingItemId: itemId,
          name: item.name,
          unit: item.unit,
          quantity: scaledQuantity,
          cost: lineCost,
        });
      }
    }
  }

  const ingredientTotals = Array.from(ingredientMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "th")
  );
  const packagingTotals = Array.from(packagingMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "th")
  );

  return {
    plan,
    menuLines,
    ingredientTotals,
    packagingTotals,
    totalRecipeCost,
    totalPackagingCost,
    totalCost: totalRecipeCost + totalPackagingCost + totalOverheadCost,
  };
}

export function getProductionRollup(planId: string): ProductionRollup {
  const plan = getEffectivePlanById(planId);

  if (!plan) {
    throw new Error(`Production plan not found: "${planId}"`);
  }

  return getProductionRollupForPlan(plan);
}
