/**
 * Builder workspace — persisted menu drafts in LocalStorage.
 *
 * Not the same as standard Menus (MenuRepository).
 * SavedMenu is experimental work-in-progress from the Menu Builder UI.
 */
import type { SavedMenu } from "../menus/builder/types";
import { normalizeSavedMenu } from "../menus/saleStatus";
import { addActivity } from "./ActivityLogRepository";
import { addVersion } from "./VersionHistoryRepository";

export const KL_BUILDER_MENUS_KEY = "kl-builder-menus";

function readAll(): SavedMenu[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KL_BUILDER_MENUS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return (parsed as SavedMenu[]).map(normalizeSavedMenu);
  } catch {
    return [];
  }
}

function writeAll(menus: SavedMenu[]): void {
  localStorage.setItem(
    KL_BUILDER_MENUS_KEY,
    JSON.stringify(menus.map(normalizeSavedMenu))
  );
}

export function getAllSavedMenus(): SavedMenu[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getSavedMenuById(id: string): SavedMenu | undefined {
  return readAll().find((menu) => menu.id === id);
}

/** First menu draft/sale linked to a recipe (1:1 for this queue). */
export function getSavedMenuByRecipeId(
  recipeId: string
): SavedMenu | undefined {
  if (!recipeId.trim()) return undefined;
  return readAll().find((menu) => menu.recipeId === recipeId);
}

export function createSavedMenu(menu: SavedMenu): void {
  const menus = readAll();
  menus.push(normalizeSavedMenu(menu));
  writeAll(menus);

  addActivity({
    type: "menu_create",
    message: `สร้างเมนูขาย "${menu.name}"`,
    entityType: "menu",
    entityId: menu.id,
  });
}

export function updateSavedMenu(
  menu: SavedMenu,
  options: { recordVersion?: boolean } = {}
): void {
  const { recordVersion = true } = options;
  const existing = getSavedMenuById(menu.id);

  if (existing && recordVersion) {
    addVersion({
      entityType: "saved_menu",
      entityId: menu.id,
      snapshot: existing,
      note: "ก่อนแก้ไข",
    });
  }

  const menus = readAll();
  const index = menus.findIndex((item) => item.id === menu.id);
  if (index === -1) return;

  menus[index] = normalizeSavedMenu(menu);
  writeAll(menus);

  addActivity({
    type: "menu_edit",
    message: `แก้ไขเมนูขาย "${menu.name}"`,
    entityType: "menu",
    entityId: menu.id,
  });
}

export function deleteSavedMenu(id: string): SavedMenu | undefined {
  const menu = getSavedMenuById(id);
  if (!menu) return undefined;

  writeAll(readAll().filter((item) => item.id !== id));

  addActivity({
    type: "menu_delete",
    message: `ลบเมนูขาย "${menu.name}"`,
    entityType: "menu",
    entityId: menu.id,
  });

  return menu;
}

/** Restore a menu removed by deleteSavedMenu (undo). */
export function restoreSavedMenu(menu: SavedMenu): void {
  const menus = readAll();
  if (menus.some((item) => item.id === menu.id)) return;

  menus.push(normalizeSavedMenu(menu));
  writeAll(menus);
}

export function duplicateSavedMenu(id: string): SavedMenu | null {
  const source = getSavedMenuById(id);
  if (!source) return null;

  const now = new Date().toISOString();
  const copy: SavedMenu = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} (สำเนา)`,
    createdAt: now,
    updatedAt: now,
  };

  createSavedMenu(copy);
  return copy;
}

export function filterSavedMenus(menus: SavedMenu[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return menus;

  return menus.filter((menu) => menu.name.toLowerCase().includes(normalized));
}

/** Link an existing recipe to a menu without creating a duplicate menu. */
export function linkRecipeToSavedMenu(
  menuId: string,
  recipeId: string
): SavedMenu | null {
  const menu = getSavedMenuById(menuId);
  if (!menu || !recipeId.trim()) return null;

  const updated = normalizeSavedMenu({
    ...menu,
    recipeId: recipeId.trim(),
    updatedAt: new Date().toISOString(),
  });
  updateSavedMenu(updated);
  return updated;
}
