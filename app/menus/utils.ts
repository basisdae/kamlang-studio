import type { Menu } from "../menu/types";
import type { SavedMenu } from "./builder/types";
import { getSaleStatus } from "./saleStatus";

export function filterMenusByName(menus: Menu[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return menus;

  return menus.filter((menu) => menu.name.toLowerCase().includes(query));
}

export function formatMenuBaht(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export function savedMenuToMenu(savedMenu: SavedMenu): Menu {
  const saleStatus = getSaleStatus(savedMenu);
  return {
    id: savedMenu.id,
    name: savedMenu.name,
    category: savedMenu.category,
    recipeId: savedMenu.recipeId,
    packagingSetId: savedMenu.packagingSetId,
    sellingPrice: savedMenu.sellingPrice,
    isActive: saleStatus === "active",
    notes: savedMenu.notes,
    imageUrl: savedMenu.imageUrl,
  };
}
