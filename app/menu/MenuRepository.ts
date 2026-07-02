/**
 * Read-only repository for Menu items (สินค้าที่ขาย).
 *
 * Data flow:
 *   IngredientRepository → RecipeRepository → MenuRepository
 *
 * A Menu references a Standard Recipe by recipeId.
 * Selling price lives on Menu, not Recipe.
 *
 * @see app/menu/README.md
 */
import { getPackagingSetById } from "../packaging/PackagingSetRepository";
import { getRecipeById } from "../recipes/RecipeRepository";
import { getMenuSeeds } from "./seed";
import type { Menu, MenuSeed } from "./types";

let menuCache: Menu[] | null = null;

function validateMenuSeed(menu: MenuSeed): void {
  if (!getRecipeById(menu.recipeId)) {
    throw new Error(
      `Menu "${menu.name}" (${menu.id}) references unknown recipe "${menu.recipeId}"`
    );
  }

  if (menu.packagingSetId && !getPackagingSetById(menu.packagingSetId)) {
    throw new Error(
      `Menu "${menu.name}" (${menu.id}) references unknown packaging set "${menu.packagingSetId}"`
    );
  }
}

function loadMenus(): Menu[] {
  if (!menuCache) {
    menuCache = getMenuSeeds().map((menu) => ({ ...menu }));
    menuCache.forEach(validateMenuSeed);
  }

  return menuCache;
}

export function getAllMenus(): Menu[] {
  return loadMenus();
}

export function getMenuById(id: string): Menu | undefined {
  return loadMenus().find((menu) => menu.id === id);
}

export function getMenusByCategory(category: string): Menu[] {
  const normalized = category.trim().toLowerCase();

  return loadMenus().filter(
    (menu) => menu.category.toLowerCase() === normalized
  );
}

export function resetMenuCache(): void {
  menuCache = null;
}
