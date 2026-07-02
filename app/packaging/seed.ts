import { getPackagingItemSeeds } from "./itemSeed";
import type { PackagingSeed } from "./types";

/**
 * V1 seed adapter — maps PackagingItem seeds to legacy Packaging shape.
 * Used by PackagingRepository (unchanged).
 */
export function getPackagingSeeds(): PackagingSeed[] {
  return getPackagingItemSeeds().map((item) => ({
    id: item.id,
    name: item.name,
    cost: item.cost,
    category: item.category,
    isActive: item.active,
  }));
}
