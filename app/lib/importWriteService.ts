/**
 * Excel import write — conflict detection and localStorage persistence.
 *
 * Does not modify demo JSON or repository files.
 */
import { mergeUserMasterRecords } from "../data/mergeUserMaster";
import { loadDataset } from "../data/loadDataset";
import demoIngredients from "../data/demo/ingredients.json";
import userIngredients from "../data/user/ingredients.json";
import demoRecipes from "../data/demo/recipes.json";
import userRecipes from "../data/user/recipes.json";
import demoPackagingItems from "../data/demo/packaging-items.json";
import userPackagingItems from "../data/user/packaging-items.json";
import demoMenus from "../data/demo/menus.json";
import userMenus from "../data/user/menus.json";
import type { LegacyIngredientRecord } from "../ingredients/types";
import { resetIngredientCache } from "../ingredients/IngredientRepository";
import type { ImportUiType } from "../import/types";
import { IMPORT_TYPE_OPTIONS } from "../import/types";
import type { MenuSeed } from "../menu/types";
import { resetMenuCache } from "../menu/MenuRepository";
import type { PackagingItemSeed } from "../packaging/types";
import { resetPackagingItemCache } from "../packaging/PackagingItemRepository";
import { resetPackagingCache } from "../packaging/PackagingRepository";
import {
  getUserMasterIngredients,
  getUserMasterMenus,
  getUserMasterPackagingItems,
  getUserMasterRecipes,
  saveUserMasterIngredients,
  saveUserMasterMenus,
  saveUserMasterPackagingItems,
  saveUserMasterRecipes,
} from "../repositories/UserMasterDataRepository";
import { addActivity } from "../repositories/ActivityLogRepository";
import type { RecipeSeed } from "../recipes/types";
import { resetRecipeCache } from "../recipes/RecipeRepository";

export type ConflictResolution = "skip" | "replace" | "add_new";

export type ImportConflict<T extends { id: string; name: string }> = {
  incoming: T;
  existing: T;
  matchBy: "id" | "name";
};

export type ImportWriteSummary = {
  imported: number;
  skipped: number;
  replaced: number;
  addedNew: number;
};

type NamedRecord = { id: string; name: string };

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function getBaseIngredients(): LegacyIngredientRecord[] {
  return loadDataset(
    "ingredients",
    demoIngredients as LegacyIngredientRecord[],
    userIngredients as LegacyIngredientRecord[]
  );
}

function getBaseRecipes(): RecipeSeed[] {
  return loadDataset(
    "recipes",
    demoRecipes as RecipeSeed[],
    userRecipes as RecipeSeed[]
  );
}

function getBasePackagingItems(): PackagingItemSeed[] {
  return loadDataset(
    "packagingItems",
    demoPackagingItems as PackagingItemSeed[],
    userPackagingItems as PackagingItemSeed[]
  );
}

function getBaseMenus(): MenuSeed[] {
  return loadDataset("menus", demoMenus as MenuSeed[], userMenus as MenuSeed[]);
}

function getEffectiveRecords<T extends NamedRecord>(
  type: ImportUiType
): T[] {
  switch (type) {
    case "ingredients":
      return mergeUserMasterRecords(
        getBaseIngredients(),
        getUserMasterIngredients()
      ) as unknown as T[];
    case "recipes":
      return mergeUserMasterRecords(
        getBaseRecipes(),
        getUserMasterRecipes()
      ) as unknown as T[];
    case "packaging":
      return mergeUserMasterRecords(
        getBasePackagingItems(),
        getUserMasterPackagingItems()
      ) as unknown as T[];
    case "menus":
      return mergeUserMasterRecords(
        getBaseMenus(),
        getUserMasterMenus()
      ) as unknown as T[];
    default:
      return [];
  }
}

function getUserLayerRecords<T extends { id: string }>(
  type: ImportUiType
): T[] {
  switch (type) {
    case "ingredients":
      return getUserMasterIngredients() as unknown as T[];
    case "recipes":
      return getUserMasterRecipes() as unknown as T[];
    case "packaging":
      return getUserMasterPackagingItems() as unknown as T[];
    case "menus":
      return getUserMasterMenus() as unknown as T[];
    default:
      return [];
  }
}

function saveUserLayerRecords<T extends { id: string }>(
  type: ImportUiType,
  records: T[]
): void {
  switch (type) {
    case "ingredients":
      saveUserMasterIngredients(records as unknown as LegacyIngredientRecord[]);
      break;
    case "recipes":
      saveUserMasterRecipes(records as unknown as RecipeSeed[]);
      break;
    case "packaging":
      saveUserMasterPackagingItems(records as unknown as PackagingItemSeed[]);
      break;
    case "menus":
      saveUserMasterMenus(records as unknown as MenuSeed[]);
      break;
  }
}

export function detectImportConflicts<T extends NamedRecord>(
  type: ImportUiType,
  incoming: T[]
): ImportConflict<T>[] {
  const effective = getEffectiveRecords<T>(type);
  const byId = new Map(effective.map((item) => [item.id, item]));
  const byName = new Map(
    effective.map((item) => [normalizeName(item.name), item])
  );

  const conflicts: ImportConflict<T>[] = [];
  const seen = new Set<string>();

  for (const record of incoming) {
    const idKey = `id:${record.id}`;
    const nameKey = `name:${normalizeName(record.name)}`;
    const existingById = byId.get(record.id);
    const existingByName = byName.get(normalizeName(record.name));

    if (existingById && !seen.has(idKey)) {
      seen.add(idKey);
      conflicts.push({
        incoming: record,
        existing: existingById,
        matchBy: "id",
      });
      continue;
    }

    if (
      existingByName &&
      existingByName.id !== record.id &&
      !seen.has(nameKey)
    ) {
      seen.add(nameKey);
      conflicts.push({
        incoming: record,
        existing: existingByName,
        matchBy: "name",
      });
    }
  }

  return conflicts;
}

function makeUniqueId(baseId: string, usedIds: Set<string>): string {
  let candidate = `${baseId}-import`;
  let counter = 2;

  while (usedIds.has(candidate)) {
    candidate = `${baseId}-import-${counter}`;
    counter += 1;
  }

  return candidate;
}

function makeUniqueName(baseName: string, usedNames: Set<string>): string {
  let candidate = `${baseName} (นำเข้า)`;
  let counter = 2;

  while (usedNames.has(normalizeName(candidate))) {
    candidate = `${baseName} (นำเข้า ${counter})`;
    counter += 1;
  }

  return candidate;
}

export function commitImportWrite<T extends NamedRecord>(
  type: ImportUiType,
  incoming: T[],
  resolution: ConflictResolution
): ImportWriteSummary {
  const summary: ImportWriteSummary = {
    imported: 0,
    skipped: 0,
    replaced: 0,
    addedNew: 0,
  };

  const effective = getEffectiveRecords<T>(type);
  const userLayer = getUserLayerRecords<T>(type);
  const userById = new Map(userLayer.map((item) => [item.id, item]));
  const usedIds = new Set(effective.map((item) => item.id));
  const usedNames = new Set(effective.map((item) => normalizeName(item.name)));

  const conflicts = detectImportConflicts(type, incoming);

  for (const record of incoming) {
    const conflict = conflicts.find((item) => item.incoming.id === record.id);

    if (!conflict) {
      userById.set(record.id, record);
      usedIds.add(record.id);
      usedNames.add(normalizeName(record.name));
      summary.imported += 1;
      continue;
    }

    if (resolution === "skip") {
      summary.skipped += 1;
      continue;
    }

    if (resolution === "replace") {
      const targetId =
        conflict.matchBy === "id" ? conflict.existing.id : conflict.existing.id;
      const nextRecord = { ...record, id: targetId } as T;

      userById.set(targetId, nextRecord);
      usedIds.add(targetId);
      usedNames.add(normalizeName(nextRecord.name));
      summary.replaced += 1;
      continue;
    }

    const nextId = makeUniqueId(record.id, usedIds);
    let nextName = record.name;

    if (usedNames.has(normalizeName(nextName))) {
      nextName = makeUniqueName(record.name, usedNames);
    }

    const nextRecord = { ...record, id: nextId, name: nextName } as T;
    userById.set(nextId, nextRecord);
    usedIds.add(nextId);
    usedNames.add(normalizeName(nextName));
    summary.addedNew += 1;
  }

  saveUserLayerRecords(type, Array.from(userById.values()));
  resetMasterCaches(type);

  const writtenCount =
    summary.imported + summary.replaced + summary.addedNew;
  const typeLabel =
    IMPORT_TYPE_OPTIONS.find((option) => option.id === type)?.label ?? type;

  addActivity({
    type: "import_data",
    message: `โหลด${typeLabel} ${writtenCount} รายการ`,
    entityType: "import",
    entityId: type,
  });

  return summary;
}

export function resetMasterCaches(type: ImportUiType): void {
  switch (type) {
    case "ingredients":
      resetIngredientCache();
      break;
    case "recipes":
      resetRecipeCache();
      break;
    case "packaging":
      resetPackagingItemCache();
      resetPackagingCache();
      break;
    case "menus":
      resetMenuCache();
      break;
  }
}
