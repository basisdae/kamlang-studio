import demoInventory from "../data/demo/inventory.json";
import userInventory from "../data/user/inventory.json";
import { loadDataset } from "../data/loadDataset";
import type { InventoryItemSeed } from "./types";

/** Inventory balance master data — demo or user JSON via loadDataset. */
export function getInventorySeeds(): InventoryItemSeed[] {
  return loadDataset(
    "inventory",
    demoInventory as InventoryItemSeed[],
    userInventory as InventoryItemSeed[]
  );
}
