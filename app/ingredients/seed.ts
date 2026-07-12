import demoIngredients from "../data/demo/ingredients.json";
import userIngredients from "../data/user/ingredients.json";
import { loadDataset } from "../data/loadDataset";
import { isEmptyDataSource } from "../data/config";
import { mergeUserMasterRecords } from "../data/mergeUserMaster";
import { getUserMasterIngredients } from "../repositories/UserMasterDataRepository";
import type { LegacyIngredientRecord } from "./types";

function getBaseIngredientSeeds(): LegacyIngredientRecord[] {
  return loadDataset(
    "ingredients",
    demoIngredients as LegacyIngredientRecord[],
    userIngredients as LegacyIngredientRecord[]
  );
}

/** Master ingredient data — demo base + localStorage user imports. */
export function getIngredientSeeds(): LegacyIngredientRecord[] {
  if (isEmptyDataSource()) return [];
  return mergeUserMasterRecords(
    getBaseIngredientSeeds(),
    getUserMasterIngredients()
  );
}

/** @deprecated Use getIngredientSeeds() for runtime merge. */
export const ingredientSeeds: LegacyIngredientRecord[] = getBaseIngredientSeeds();
