/**
 * Import a builder recipe into a store-menu draft (SavedMenu, isActive: false).
 * Does not invent selling price/category/image. Does not delete the recipe.
 */

import {
  createSavedMenu,
  getSavedMenuById,
  getSavedMenuByRecipeId,
} from "../repositories/SavedMenuRepository";
import {
  getSavedRecipeById,
  updateSavedRecipe,
} from "../repositories/SavedRecipeRepository";
import type { SavedMenu } from "../menus/builder/types";

export type ImportRecipeToMenuResult =
  | { ok: true; menuId: string; created: true }
  | { ok: true; menuId: string; created: false }
  | { ok: false; reason: "recipe_not_found" };

/** Existing linked menu for this recipe (1:1). */
export function findMenuLinkedToRecipe(
  recipeId: string
): SavedMenu | undefined {
  const recipe = getSavedRecipeById(recipeId);
  if (recipe?.linkedMenuId) {
    const byLink = getSavedMenuById(recipe.linkedMenuId);
    if (byLink) return byLink;
  }
  return getSavedMenuByRecipeId(recipeId);
}

/**
 * Create inactive menu draft from recipe, or return existing link.
 * Category and selling price left empty/0 for the user.
 */
export function importRecipeToMenuDraft(
  recipeId: string
): ImportRecipeToMenuResult {
  const recipe = getSavedRecipeById(recipeId);
  if (!recipe) return { ok: false, reason: "recipe_not_found" };

  const existing = findMenuLinkedToRecipe(recipeId);
  if (existing) {
    if (recipe.linkedMenuId !== existing.id || recipe.status !== "imported") {
      updateSavedRecipe(
        {
          ...recipe,
          status: "imported",
          linkedMenuId: existing.id,
          updatedAt: new Date().toISOString(),
        },
        { recordVersion: false }
      );
    }
    return { ok: true, menuId: existing.id, created: false };
  }

  const now = new Date().toISOString();
  const menuId = crypto.randomUUID();
  const draft: SavedMenu = {
    id: menuId,
    name: recipe.menuName.trim() || "แบบร่างเมนู",
    category: "",
    recipeId: recipe.id,
    sellingPrice: 0,
    isActive: false,
    saleStatus: "draft",
    notes: [
      "แบบร่างจากสูตร — ยังไม่เปิดขาย",
      `ต้นทุนสูตร ฿${recipe.totalCost.toFixed(2)}`,
      recipe.suggestedPrice > 0
        ? `ราคาแนะนำจากสูตร ฿${recipe.suggestedPrice} (ยังไม่ใช่ราคาขาย)`
        : null,
    ]
      .filter(Boolean)
      .join("\n"),
    createdAt: now,
    updatedAt: now,
  };

  createSavedMenu(draft);
  updateSavedRecipe(
    {
      ...recipe,
      status: "imported",
      linkedMenuId: menuId,
      updatedAt: now,
    },
    { recordVersion: false }
  );

  return { ok: true, menuId, created: true };
}
