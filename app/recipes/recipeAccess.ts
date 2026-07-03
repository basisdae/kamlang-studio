/**
 * Unified recipe lookup — standard seeds + builder-saved recipes.
 */
import { getStandardRecipeCost } from "../lib/costService";
import { getBuilderSavedRecipes, getSavedRecipeById } from "../repositories/SavedRecipeRepository";
import { getAllRecipes, getRecipeById } from "./RecipeRepository";
import type { Recipe } from "./types";

export type EffectiveRecipeLines = {
  id: string;
  name: string;
  lines: Array<{
    ingredientId: string;
    quantity: number;
    unit: string;
  }>;
};

export function getEffectiveRecipeLines(
  id: string
): EffectiveRecipeLines | undefined {
  const saved = getSavedRecipeById(id);

  if (saved) {
    return {
      id: saved.id,
      name: saved.menuName,
      lines: saved.ingredients.map((line) => ({
        ingredientId: line.ingredientId,
        quantity: line.quantity,
        unit: line.unit,
      })),
    };
  }

  const standard = getRecipeById(id);

  if (!standard) {
    return undefined;
  }

  return {
    id: standard.id,
    name: standard.name,
    lines: standard.lines.map((line) => ({
      ingredientId: line.ingredientId,
      quantity: line.quantity,
      unit: line.unit,
    })),
  };
}

export function getRecipeCostById(recipeId: string): number {
  const saved = getSavedRecipeById(recipeId);

  if (saved) {
    return Math.round(saved.totalCost);
  }

  const standard = getRecipeById(recipeId);

  if (!standard) {
    throw new Error(`Recipe not found: "${recipeId}"`);
  }

  return getStandardRecipeCost(standard);
}

/** Recipes for menu builder dropdown — yours first, then samples. */
export function getAllRecipesForPicker(): Pick<Recipe, "id" | "name" | "category">[] {
  const saved = getBuilderSavedRecipes().map((recipe) => ({
    id: recipe.id,
    name: recipe.menuName,
    category: recipe.category,
  }));

  const savedIds = new Set(saved.map((recipe) => recipe.id));
  const standard = getAllRecipes()
    .filter((recipe) => !savedIds.has(recipe.id))
    .map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
    }));

  return [...saved, ...standard];
}
