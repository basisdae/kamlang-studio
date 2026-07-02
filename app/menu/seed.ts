import demoMenus from "../data/demo/menus.json";
import userMenus from "../data/user/menus.json";
import { loadDataset } from "../data/loadDataset";
import { mergeUserMasterRecords } from "../data/mergeUserMaster";
import { getUserMasterMenus } from "../repositories/UserMasterDataRepository";
import type { MenuSeed } from "./types";

function getBaseMenuSeeds(): MenuSeed[] {
  return loadDataset("menus", demoMenus as MenuSeed[], userMenus as MenuSeed[]);
}

/** Sellable menu master data — demo base + localStorage user imports. */
export function getMenuSeeds(): MenuSeed[] {
  return mergeUserMasterRecords(getBaseMenuSeeds(), getUserMasterMenus());
}

/** @deprecated Use getMenuSeeds() for runtime merge. */
export const menuSeeds: MenuSeed[] = getBaseMenuSeeds();
