import { ingredients } from "../data/ingredients";
import type { CoreRecipe, RecipeIngredientLine } from "../data/recipeCore";

function getIngredientById(id: string) {
  return ingredients.find((item) => item.id === id);
}

function convertToPurchaseUnitCost(line: RecipeIngredientLine) {
  const ingredient = getIngredientById(line.ingredientId);

  if (!ingredient) return 0;

  if (ingredient.purchaseUnit === "kg" && line.unit === "g") {
    return (ingredient.purchasePrice / 1000) * line.quantity;
  }

  if (ingredient.purchaseUnit === "liter" && line.unit === "ml") {
    return (ingredient.purchasePrice / 1000) * line.quantity;
  }

  if (ingredient.purchaseUnit === line.unit) {
    return ingredient.purchasePrice * line.quantity;
  }

  return ingredient.purchasePrice * line.quantity;
}

export function getRecipeCoreCost(recipe: CoreRecipe) {
  return Math.round(
    recipe.ingredients.reduce((sum, line) => {
      return sum + convertToPurchaseUnitCost(line);
    }, 0)
  );
}

export function getRecipeCoreFoodCost(recipe: CoreRecipe) {
  return Math.round((getRecipeCoreCost(recipe) / recipe.sellingPrice) * 100);
}

export function getRecipeCostLines(recipe: CoreRecipe) {
  return recipe.ingredients.map((line) => {
    const ingredient = getIngredientById(line.ingredientId);

    return {
      name: ingredient?.name ?? "ไม่พบวัตถุดิบ",
      quantity: line.quantity,
      unit: line.unit,
      cost: Math.round(convertToPurchaseUnitCost(line)),
    };
  });
}
export function getSuggestedSellingPrice(recipe: CoreRecipe, targetFoodCost = 35) {
  const cost = getRecipeCoreCost(recipe);
  const rawPrice = cost / (targetFoodCost / 100);

  return Math.ceil(rawPrice / 10) * 10 - 1;
}