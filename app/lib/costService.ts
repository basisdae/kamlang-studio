/**
 * Cost calculations for Standard Recipes.
 *
 * Uses IngredientRepository for ingredient cost data.
 * Selling price is not stored on Recipe — pass a reference price from Menu
 * or use getSuggestedSellingPrice() until Menu exists.
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import { calcLineCost } from "../ingredients/utils";
import type { Recipe, RecipeLine } from "../recipes/types";
import { getMainPrice, getSuggestedPriceFromFoodCost } from "./pricingService";

function convertLineCost(line: RecipeLine) {
  const ingredient = getIngredientById(line.ingredientId);

  if (!ingredient) return 0;

  return calcLineCost(ingredient, line.quantity, line.unit);
}

export function getStandardRecipeCost(recipe: Pick<Recipe, "lines">) {
  return Math.round(
    recipe.lines.reduce((sum, line) => sum + convertLineCost(line), 0)
  );
}

export function getStandardRecipeFoodCost(cost: number, sellingPrice: number) {
  if (sellingPrice <= 0) return 0;

  return Math.round((cost / sellingPrice) * 100);
}

export function getStandardRecipeCostLines(recipe: Pick<Recipe, "lines">) {
  return recipe.lines.map((line) => {
    const ingredient = getIngredientById(line.ingredientId);

    return {
      name: ingredient?.name ?? "ไม่พบวัตถุดิบ",
      quantity: line.quantity,
      unit: line.unit,
      cost: Math.round(convertLineCost(line)),
    };
  });
}

/** Suggested selling price from cost + target food cost %. Menu layer will own actual prices. */
export function getSuggestedSellingPrice(recipe: Pick<Recipe, "lines">) {
  return getSuggestedPriceFromFoodCost(getStandardRecipeCost(recipe));
}

/** Reference sell price: channel price from PricingService, or suggested if unset. */
export function getRecipeReferencePrice(recipe: Pick<Recipe, "id" | "lines">) {
  return getMainPrice(recipe.id) ?? getSuggestedSellingPrice(recipe);
}
