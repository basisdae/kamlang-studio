/**
 * Builder workspace — persisted recipe drafts in LocalStorage.
 *
 * Not the same as Standard Recipes (RecipeRepository).
 * SavedRecipe is experimental work-in-progress from the Builder UI.
 *
 * @see app/recipes/README.md
 */
import type { SavedRecipe } from "../recipes/builder/types";
import { addVersion } from "./VersionHistoryRepository";

export const KL_BUILDER_RECIPES_KEY = "kl-builder-recipes";
export const STANDARD_DETAIL_DRAFT_PREFIX = "standard-detail-";

function readAll(): SavedRecipe[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KL_BUILDER_RECIPES_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as SavedRecipe[];
  } catch {
    return [];
  }
}

function writeAll(recipes: SavedRecipe[]): void {
  localStorage.setItem(KL_BUILDER_RECIPES_KEY, JSON.stringify(recipes));
}

export function getAllSavedRecipes(): SavedRecipe[] {
  return readAll().sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getBuilderSavedRecipes(): SavedRecipe[] {
  return getAllSavedRecipes().filter(
    (recipe) => !recipe.id.startsWith(STANDARD_DETAIL_DRAFT_PREFIX)
  );
}

export function getSavedRecipeById(id: string): SavedRecipe | undefined {
  return readAll().find((recipe) => recipe.id === id);
}

export function createSavedRecipe(recipe: SavedRecipe): void {
  const recipes = readAll();
  recipes.push(recipe);
  writeAll(recipes);
}

export function updateSavedRecipe(
  recipe: SavedRecipe,
  options: { recordVersion?: boolean } = {}
): void {
  const { recordVersion = true } = options;
  const existing = getSavedRecipeById(recipe.id);

  if (existing && recordVersion) {
    addVersion({
      entityType: "saved_recipe",
      entityId: recipe.id,
      snapshot: existing,
      note: "ก่อนแก้ไข",
    });
  }

  const recipes = readAll();
  const index = recipes.findIndex((item) => item.id === recipe.id);
  if (index === -1) return;

  recipes[index] = recipe;
  writeAll(recipes);
}

export function deleteSavedRecipe(id: string): void {
  writeAll(readAll().filter((recipe) => recipe.id !== id));
}

export function duplicateSavedRecipe(id: string): SavedRecipe | null {
  const source = getSavedRecipeById(id);
  if (!source) return null;

  const now = new Date().toISOString();
  const copy: SavedRecipe = {
    ...source,
    id: crypto.randomUUID(),
    menuName: `${source.menuName} (Copy)`,
    ingredients: source.ingredients.map((line) => ({ ...line })),
    createdAt: now,
    updatedAt: now,
    detailState: undefined,
  };

  createSavedRecipe(copy);
  return copy;
}

export function filterSavedRecipes(recipes: SavedRecipe[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return recipes;

  return recipes.filter(
    (recipe) =>
      recipe.menuName.toLowerCase().includes(normalized) ||
      recipe.category.toLowerCase().includes(normalized)
  );
}
