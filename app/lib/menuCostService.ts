/**
 * Cost calculations for sellable Menu items.
 *
 * Menu Cost = Recipe Cost + PackagingSet Cost + per-portion overhead (settings)
 *
 * Uses MenuRepository, RecipeRepository, PackagingSetRepository,
 * PackagingItemRepository, and costService.
 * Does not modify any repository.
 */
import { getEffectiveMenuById } from "../menu/menuAccess";
import { getPackagingItemById } from "../packaging/PackagingItemRepository";
import { getPackagingSetById } from "../packaging/PackagingSetRepository";
import { getRecipeCostById } from "../recipes/recipeAccess";
import { getPerPortionCosts } from "../settings/pricingAccess";

export type MenuCostBreakdown = {
  recipeCost: number;
  packagingCost: number;
  labourCost: number;
  gasCost: number;
  electricityCost: number;
  totalCost: number;
  sellingPrice: number;
  grossProfit: number;
  grossProfitPercent: number;
};

export type MenuCostInput = {
  recipeId: string;
  packagingSetId?: string;
  sellingPrice: number;
};

function getPackagingSetCost(packagingSetId?: string): number {
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

export function calculateMenuCost(input: MenuCostInput): MenuCostBreakdown {
  if (input.packagingSetId && !getPackagingSetById(input.packagingSetId)) {
    throw new Error(`Packaging set not found: "${input.packagingSetId}"`);
  }

  const recipeCost = getRecipeCostById(input.recipeId);
  const packagingCost = getPackagingSetCost(input.packagingSetId);
  const { labourCost, gasCost, electricityCost } = getPerPortionCosts();
  const totalCost =
    recipeCost + packagingCost + labourCost + gasCost + electricityCost;
  const sellingPrice = input.sellingPrice;
  const grossProfit = sellingPrice - totalCost;
  const grossProfitPercent =
    sellingPrice > 0 ? Math.round((grossProfit / sellingPrice) * 100) : 0;

  return {
    recipeCost,
    packagingCost,
    labourCost,
    gasCost,
    electricityCost,
    totalCost,
    sellingPrice,
    grossProfit,
    grossProfitPercent,
  };
}

export function getMenuCost(menuId: string): MenuCostBreakdown {
  const menu = getEffectiveMenuById(menuId);

  if (!menu) {
    throw new Error(`Menu not found: "${menuId}"`);
  }

  if (menu.packagingSetId && !getPackagingSetById(menu.packagingSetId)) {
    throw new Error(
      `Menu "${menu.name}" (${menu.id}) references unknown packaging set "${menu.packagingSetId}"`
    );
  }

  return calculateMenuCost({
    recipeId: menu.recipeId,
    packagingSetId: menu.packagingSetId,
    sellingPrice: menu.sellingPrice,
  });
}
