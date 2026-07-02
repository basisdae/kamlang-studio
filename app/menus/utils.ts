import type { Menu } from "../menu/types";
import type { SavedMenu } from "./builder/types";

export function filterMenusByName(menus: Menu[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return menus;

  return menus.filter((menu) => menu.name.toLowerCase().includes(query));
}

export function formatMenuBaht(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export function savedMenuToMenu(savedMenu: SavedMenu): Menu {
  return {
    id: savedMenu.id,
    name: savedMenu.name,
    category: savedMenu.category,
    recipeId: savedMenu.recipeId,
    packagingSetId: savedMenu.packagingSetId,
    sellingPrice: savedMenu.sellingPrice,
    isActive: savedMenu.isActive,
    notes: savedMenu.notes,
  };
}
