import type { RecipeLine } from "./types";
import { calcLineCost } from "../../ingredients/utils";
import { getSuggestedPriceFromCost } from "../../lib/pricingService";

export { calcLineCost };

export function roundPrice(price: number) {
  return Math.ceil(price / 10) * 10 - 1;
}

export function calcProfit(cost: number, sell: number) {
  return sell - cost;
}

export function calcProfitPercent(cost: number, sell: number) {
  if (cost <= 0) return 0;

  return Math.round(((sell - cost) / cost) * 100);
}

export function calcSuggestedPrice(totalCost: number) {
  return getSuggestedPriceFromCost(totalCost);
}

export function calcTotalCost(lines: RecipeLine[]) {
  return lines.reduce((sum, item) => sum + item.cost, 0);
}

export function validateRecipeForSave(
  menuName: string,
  lines: RecipeLine[]
) {
  const errors: { menuName?: string; ingredients?: string } = {};

  if (!menuName.trim()) {
    errors.menuName = "กรุณากระบุชื่อสูตร";
  }

  if (lines.length === 0) {
    errors.ingredients = "กรุณาเพิ่มวัตถุดิบอย่างน้อย 1 รายการ";
  }

  return errors;
}

export function hasValidationErrors(errors: {
  menuName?: string;
  ingredients?: string;
}) {
  return Boolean(errors.menuName || errors.ingredients);
}
