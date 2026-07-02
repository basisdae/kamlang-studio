/**
 * Runtime user master data from Excel import (localStorage).
 *
 * Layered on top of demo/file seeds — does not modify demo JSON.
 *
 * @see app/import/README.md
 */
import type { LegacyIngredientRecord } from "../ingredients/types";
import type { MenuSeed } from "../menu/types";
import type { PackagingItemSeed } from "../packaging/types";
import type { RecipeSeed } from "../recipes/types";
import type { ImportUiType } from "../import/types";

export const KL_USER_MASTER_INGREDIENTS_KEY = "kl-user-master-ingredients";
export const KL_USER_MASTER_RECIPES_KEY = "kl-user-master-recipes";
export const KL_USER_MASTER_PACKAGING_KEY = "kl-user-master-packaging";
export const KL_USER_MASTER_MENUS_KEY = "kl-user-master-menus";

const KEY_BY_TYPE: Record<ImportUiType, string> = {
  ingredients: KL_USER_MASTER_INGREDIENTS_KEY,
  recipes: KL_USER_MASTER_RECIPES_KEY,
  packaging: KL_USER_MASTER_PACKAGING_KEY,
  menus: KL_USER_MASTER_MENUS_KEY,
};

function readArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as T[];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, records: T[]): void {
  localStorage.setItem(key, JSON.stringify(records));
}

export function getUserMasterIngredients(): LegacyIngredientRecord[] {
  return readArray<LegacyIngredientRecord>(KL_USER_MASTER_INGREDIENTS_KEY);
}

export function getUserMasterRecipes(): RecipeSeed[] {
  return readArray<RecipeSeed>(KL_USER_MASTER_RECIPES_KEY);
}

export function getUserMasterPackagingItems(): PackagingItemSeed[] {
  return readArray<PackagingItemSeed>(KL_USER_MASTER_PACKAGING_KEY);
}

export function getUserMasterMenus(): MenuSeed[] {
  return readArray<MenuSeed>(KL_USER_MASTER_MENUS_KEY);
}

export function saveUserMasterIngredients(records: LegacyIngredientRecord[]): void {
  writeArray(KL_USER_MASTER_INGREDIENTS_KEY, records);
}

export function saveUserMasterRecipes(records: RecipeSeed[]): void {
  writeArray(KL_USER_MASTER_RECIPES_KEY, records);
}

export function saveUserMasterPackagingItems(records: PackagingItemSeed[]): void {
  writeArray(KL_USER_MASTER_PACKAGING_KEY, records);
}

export function saveUserMasterMenus(records: MenuSeed[]): void {
  writeArray(KL_USER_MASTER_MENUS_KEY, records);
}

export function upsertUserMasterRecords<T extends { id: string }>(
  type: ImportUiType,
  records: T[]
): void {
  const key = KEY_BY_TYPE[type];
  const existing = readArray<T>(key);
  const byId = new Map(existing.map((item) => [item.id, item]));

  for (const record of records) {
    byId.set(record.id, record);
  }

  writeArray(key, Array.from(byId.values()));
}
