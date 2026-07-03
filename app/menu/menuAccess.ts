/**
 * Unified menu lookup — standard seeds + builder-saved menus.
 */
import { savedMenuToMenu } from "../menus/utils";
import { getAllSavedMenus, getSavedMenuById } from "../repositories/SavedMenuRepository";
import { getAllMenus, getMenuById } from "./MenuRepository";
import type { Menu } from "./types";

export function getEffectiveMenuById(id: string): Menu | undefined {
  const saved = getSavedMenuById(id);

  if (saved) {
    return savedMenuToMenu(saved);
  }

  return getMenuById(id);
}

/** Active menus for production builder — yours first, then samples. */
export function getAllEffectiveMenus(): Menu[] {
  const saved = getAllSavedMenus()
    .filter((menu) => menu.isActive)
    .map(savedMenuToMenu);

  const savedIds = new Set(saved.map((menu) => menu.id));
  const standard = getAllMenus().filter(
    (menu) => menu.isActive && !savedIds.has(menu.id)
  );

  return [...saved, ...standard];
}
