/**
 * Import bundle shape for migrating real restaurant data.
 *
 * @see app/data/MIGRATION.md
 */
import type { LegacyIngredientRecord } from "../ingredients/types";
import type { InventoryItemSeed } from "../inventory/types";
import type { MenuSeed } from "../menu/types";
import type {
  PackagingItemSeed,
  PackagingSetSeed,
} from "../packaging/types";
import type { ProductionPlanSeed } from "../production/types";
import type { RecipeSeed } from "../recipes/types";

export const KL_IMPORT_BUNDLE_VERSION = 1;

export type KlImportBundle = {
  version: typeof KL_IMPORT_BUNDLE_VERSION;
  exportedAt: string;
  ingredients: LegacyIngredientRecord[];
  recipes: RecipeSeed[];
  packagingItems: PackagingItemSeed[];
  packagingSets: PackagingSetSeed[];
  menus: MenuSeed[];
  production: ProductionPlanSeed[];
  inventory: InventoryItemSeed[];
};

export type KlDatasetName =
  | "ingredients"
  | "recipes"
  | "packagingItems"
  | "packagingSets"
  | "menus"
  | "production"
  | "inventory";
