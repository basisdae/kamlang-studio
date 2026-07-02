import demoPackagingSets from "../data/demo/packaging-sets.json";
import userPackagingSets from "../data/user/packaging-sets.json";
import { loadDataset } from "../data/loadDataset";
import type { PackagingSetSeed } from "./types";

/** Channel packaging set master data — demo or user JSON via loadDataset. */
export const packagingSetSeeds: PackagingSetSeed[] = loadDataset(
  "packagingSets",
  demoPackagingSets as PackagingSetSeed[],
  userPackagingSets as PackagingSetSeed[]
);
