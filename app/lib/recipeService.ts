import {
  getAllRecipes,
  getRecipeBySlug,
} from "../recipes/RecipeRepository";
import {
  getStandardRecipeCost,
  getStandardRecipeFoodCost,
  getRecipeReferencePrice,
} from "./costService";
import type { Recipe } from "../recipes/types";

export function getRecipes(): Recipe[] {
  return getAllRecipes();
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipeBySlug(slug);
}

export function getRecipeSummary(recipe: Recipe) {
  const cost = getStandardRecipeCost(recipe);
  const referencePrice = getRecipeReferencePrice(recipe);
  const foodCost = getStandardRecipeFoodCost(cost, referencePrice);
  const profit = referencePrice - cost;

  return {
    cost,
    foodCost,
    profit,
  };
}

export function getTotalRecipeCount() {
  return getAllRecipes().length;
}

export function getAverageFoodCost() {
  const recipes = getAllRecipes();
  if (recipes.length === 0) return 0;

  const total = recipes.reduce((sum, recipe) => {
    const cost = getStandardRecipeCost(recipe);
    const referencePrice = getRecipeReferencePrice(recipe);
    return sum + getStandardRecipeFoodCost(cost, referencePrice);
  }, 0);

  return Math.round(total / recipes.length);
}
