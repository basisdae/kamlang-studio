import type { KlImportBundle } from "./types";
import type { LegacyIngredientRecord } from "../ingredients/types";
import type { InventoryItemSeed } from "../inventory/types";
import type { MenuSeed } from "../menu/types";
import type { PackagingItemSeed, PackagingSetSeed } from "../packaging/types";
import type { ProductionPlanSeed } from "../production/types";
import type { RecipeSeed } from "../recipes/types";
import demoIngredients from "./demo/ingredients.json";
import demoRecipes from "./demo/recipes.json";
import demoPackagingItems from "./demo/packaging-items.json";
import demoPackagingSets from "./demo/packaging-sets.json";
import demoMenus from "./demo/menus.json";
import demoProduction from "./demo/production.json";
import demoInventory from "./demo/inventory.json";
import { resolveProductionDemoDates } from "./loadDataset";

/** Full demo restaurant bundle — reference for export / import tooling. */
export const demoImportBundle: KlImportBundle = {
  version: 1,
  exportedAt: "2026-01-01T00:00:00.000Z",
  ingredients: demoIngredients as LegacyIngredientRecord[],
  recipes: demoRecipes as RecipeSeed[],
  packagingItems: demoPackagingItems as PackagingItemSeed[],
  packagingSets: demoPackagingSets as PackagingSetSeed[],
  menus: demoMenus as MenuSeed[],
  production: resolveProductionDemoDates(
    demoProduction as ProductionPlanSeed[]
  ),
  inventory: demoInventory as InventoryItemSeed[],
};

export { getDataSource, isDemoDataSource, isUserDataSource } from "./config";
export { loadDataset, getActiveDataSourceLabel } from "./loadDataset";
export type { KlImportBundle, KlDatasetName } from "./types";
export { KL_IMPORT_BUNDLE_VERSION } from "./types";
