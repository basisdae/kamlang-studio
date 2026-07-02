import {
  recipes,
  getRecipeBySlug,
  getRecipeCost,
  getFoodCostPercent,
  type Recipe,
} from "../data/recipes";

export function getRecipes(): Recipe[] {
  return recipes;
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipeBySlug(slug);
}

export function getRecipeSummary(recipe: Recipe) {
  const cost = getRecipeCost(recipe);
  const foodCost = getFoodCostPercent(recipe);
  const profit = recipe.price - cost;

  return {
    cost,
    foodCost,
    profit,
  };
}

export function getTotalRecipeCount() {
  return recipes.length;
}

export function getAverageFoodCost() {
  if (recipes.length === 0) return 0;

  const total = recipes.reduce((sum, recipe) => {
    return sum + getFoodCostPercent(recipe);
  }, 0);

  return Math.round(total / recipes.length);
}