import demoRecipes from "../data/demo/recipes.json";
import userRecipes from "../data/user/recipes.json";
import { loadDataset } from "../data/loadDataset";
import { mergeUserMasterRecords } from "../data/mergeUserMaster";
import { getUserMasterRecipes } from "../repositories/UserMasterDataRepository";
import type { RecipeSeed } from "./types";

function getBaseRecipeSeeds(): RecipeSeed[] {
  return loadDataset(
    "recipes",
    demoRecipes as RecipeSeed[],
    userRecipes as RecipeSeed[]
  );
}

/** Standard recipe master data — demo base + localStorage user imports. */
export function getRecipeSeeds(): RecipeSeed[] {
  return mergeUserMasterRecords(getBaseRecipeSeeds(), getUserMasterRecipes());
}

/** @deprecated Use getRecipeSeeds() for runtime merge. */
export const recipeSeeds: RecipeSeed[] = getBaseRecipeSeeds();
