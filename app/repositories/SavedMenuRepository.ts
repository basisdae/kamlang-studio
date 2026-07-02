/**
 * Builder workspace — persisted menu drafts in LocalStorage.
 *
 * Not the same as standard Menus (MenuRepository).
 * SavedMenu is experimental work-in-progress from the Menu Builder UI.
 */
import type { SavedMenu } from "../menus/builder/types";
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

    return parsed as SavedMenu[];
  } catch {
    return [];
  }
}

function writeAll(menus: SavedMenu[]): void {
  localStorage.setItem(KL_BUILDER_MENUS_KEY, JSON.stringify(menus));
}

export function getAllSavedMenus(): SavedMenu[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getSavedMenuById(id: string): SavedMenu | undefined {
  return readAll().find((menu) => menu.id === id);
}

export function createSavedMenu(menu: SavedMenu): void {
  const menus = readAll();
  menus.push(menu);
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

  menus[index] = menu;
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

  menus.push({
    ...menu,
  });
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
