import { getIngredientSeeds } from "./seed";
import type { Ingredient } from "./types";
import { normalizeLegacyIngredient } from "./utils";

let ingredientCache: Ingredient[] | null = null;

function loadIngredients(): Ingredient[] {
  if (!ingredientCache) {
    ingredientCache = getIngredientSeeds().map(normalizeLegacyIngredient);
  }

  return ingredientCache;
}

export function getAllIngredients(): Ingredient[] {
  return loadIngredients();
}

export function getIngredientById(id: string): Ingredient | undefined {
  return loadIngredients().find((ingredient) => ingredient.id === id);
}

export function resetIngredientCache(): void {
  ingredientCache = null;
}
