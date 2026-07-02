/**
 * Read-only repository for Standard Recipes (สูตรมาตรฐาน).
 *
 * Data flow:
 *   IngredientRepository → RecipeRepository → Menu (future)
 *
 * Builder drafts are separate — see SavedRecipeRepository.
 *
 * @see app/recipes/README.md
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import { getRecipeSeeds } from "./seed";
import type { Recipe, RecipeSeed } from "./types";

let recipeCache: Recipe[] | null = null;

function validateRecipeSeed(recipe: RecipeSeed): void {
  for (const line of recipe.lines) {
    if (!getIngredientById(line.ingredientId)) {
      throw new Error(
        `Recipe "${recipe.name}" (${recipe.id}) references unknown ingredient "${line.ingredientId}"`
      );
    }
  }
}

function loadRecipes(): Recipe[] {
  if (!recipeCache) {
    recipeCache = getRecipeSeeds().map((recipe) => {
      validateRecipeSeed(recipe);

      return {
        ...recipe,
        lines: recipe.lines.map((line) => ({ ...line })),
        steps: [...recipe.steps],
      };
    });
  }

  return recipeCache;
}

export function getAllRecipes(): Recipe[] {
  return loadRecipes();
}

export function getRecipeById(id: string): Recipe | undefined {
  return loadRecipes().find((recipe) => recipe.id === id);
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return loadRecipes().find((recipe) => recipe.slug === slug);
}

export function getRecipesByCategory(category: string): Recipe[] {
  const normalized = category.trim().toLowerCase();
  return loadRecipes().filter(
    (recipe) => recipe.category.toLowerCase() === normalized
  );
}

export function resetRecipeCache(): void {
  recipeCache = null;
}
