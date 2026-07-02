import { recipePrices } from "../data/pricing";
import {
  getDefaultGpPercent,
  getTargetFoodCostPercent,
} from "../settings/pricingAccess";

export function getPricesByRecipeId(recipeId: string) {
  return recipePrices.filter((item) => item.recipeId === recipeId);
}

export function getMainPrice(recipeId: string) {
  return (
    recipePrices.find(
      (item) => item.recipeId === recipeId && item.channel === "หน้าร้าน"
    )?.price ?? null
  );
}

export function roundSuggestedPrice(price: number) {
  return Math.ceil(price / 10) * 10 - 1;
}

/** Suggested sell price from total cost using GP เป้าหมาย (% on selling price). */
export function getSuggestedPriceFromCost(totalCost: number): number {
  if (!totalCost) return 0;

  const gp = getDefaultGpPercent();
  const divisor = 1 - gp / 100;

  if (divisor <= 0) return 0;

  return roundSuggestedPrice(totalCost / divisor);
}

/** Suggested sell price from food cost using target food cost % from settings. */
export function getSuggestedPriceFromFoodCost(foodCost: number): number {
  if (!foodCost) return 0;

  const targetFoodCost = getTargetFoodCostPercent();
  const rawPrice = foodCost / (targetFoodCost / 100);

  return roundSuggestedPrice(rawPrice);
}
