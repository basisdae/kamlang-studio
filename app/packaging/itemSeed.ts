import demoPackagingItems from "../data/demo/packaging-items.json";
import userPackagingItems from "../data/user/packaging-items.json";
import { loadDataset } from "../data/loadDataset";
import { mergeUserMasterRecords } from "../data/mergeUserMaster";
import { getUserMasterPackagingItems } from "../repositories/UserMasterDataRepository";
import type { PackagingItemSeed } from "./types";

function getBasePackagingItemSeeds(): PackagingItemSeed[] {
  return loadDataset(
    "packagingItems",
    demoPackagingItems as PackagingItemSeed[],
    userPackagingItems as PackagingItemSeed[]
  );
}

/** Packaging material master data — demo base + localStorage user imports. */
export function getPackagingItemSeeds(): PackagingItemSeed[] {
  return mergeUserMasterRecords(
    getBasePackagingItemSeeds(),
    getUserMasterPackagingItems()
  );
}

/** @deprecated Use getPackagingItemSeeds() for runtime merge. */
export const packagingItemSeeds: PackagingItemSeed[] = getBasePackagingItemSeeds();
