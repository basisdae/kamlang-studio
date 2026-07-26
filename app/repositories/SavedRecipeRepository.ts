/**
 * Builder workspace — persisted recipe drafts in LocalStorage.
 *
 * Not the same as Standard Recipes (RecipeRepository).
 * SavedRecipe is experimental work-in-progress from the Builder UI.
 *
 * @see app/recipes/README.md
 */
import type {
  SavedRecipe,
  SavedRecipeLifecycleStatus,
} from "../recipes/builder/types";
import { normalizeSavedRecipeStatus } from "../recipes/builder/status";
import { getSavedMenuById, getSavedMenuByRecipeId } from "./SavedMenuRepository";
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

/** Main library list — hide archived unless includeArchived. */
export function getActiveBuilderRecipes(): SavedRecipe[] {
  return getBuilderSavedRecipes().filter(
    (recipe) => normalizeSavedRecipeStatus(recipe) !== "archived"
  );
}

export function getSavedRecipeById(id: string): SavedRecipe | undefined {
  return readAll().find((recipe) => recipe.id === id);
}

export function createSavedRecipe(recipe: SavedRecipe): void {
  const recipes = readAll();
  recipes.push({
    ...recipe,
    status: recipe.status ?? "draft",
  });
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

export function setSavedRecipeStatus(
  id: string,
  status: SavedRecipeLifecycleStatus
): SavedRecipe | null {
  const existing = getSavedRecipeById(id);
  if (!existing) return null;

  const next: SavedRecipe = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };
  updateSavedRecipe(next, { recordVersion: false });
  return next;
}

export function archiveSavedRecipe(id: string): SavedRecipe | null {
  return setSavedRecipeStatus(id, "archived");
}

export function restoreSavedRecipe(id: string): SavedRecipe | null {
  const existing = getSavedRecipeById(id);
  if (!existing) return null;
  const linked =
    (existing.linkedMenuId
      ? getSavedMenuById(existing.linkedMenuId)
      : undefined) ?? getSavedMenuByRecipeId(id);
  const nextStatus: SavedRecipeLifecycleStatus = linked ? "imported" : "draft";
  return setSavedRecipeStatus(id, nextStatus);
}

export type DeleteSavedRecipeResult =
  | { ok: true }
  | { ok: false; reason: "linked_menu"; menuId: string };

export function deleteSavedRecipe(id: string): DeleteSavedRecipeResult {
  const existing = getSavedRecipeById(id);
  const linked =
    (existing?.linkedMenuId
      ? getSavedMenuById(existing.linkedMenuId)
      : undefined) ?? getSavedMenuByRecipeId(id);
  if (linked) {
    return { ok: false, reason: "linked_menu", menuId: linked.id };
  }

  writeAll(readAll().filter((recipe) => recipe.id !== id));
  return { ok: true };
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
    status: "draft",
    linkedMenuId: undefined,
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
