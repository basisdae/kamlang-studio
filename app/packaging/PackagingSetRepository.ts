/**
 * Read-only repository for PackagingSet bundles (sales channels).
 *
 * Each set references PackagingItem ids validated on load.
 *
 * @see app/packaging/README.md
 */
import { getPackagingItemById } from "./PackagingItemRepository";
import { packagingSetSeeds } from "./setSeed";
import type { PackagingSet, PackagingSetSeed } from "./types";

let packagingSetCache: PackagingSet[] | null = null;

function validatePackagingSetSeed(set: PackagingSetSeed): void {
  if (!set.id.trim()) {
    throw new Error("PackagingSet id must not be empty");
  }

  if (!set.name.trim()) {
    throw new Error(`PackagingSet "${set.id}" must have a non-empty name`);
  }

  if (!set.description.trim()) {
    throw new Error(
      `PackagingSet "${set.name}" (${set.id}) must have a description`
    );
  }

  if (!Array.isArray(set.items) || set.items.length === 0) {
    throw new Error(
      `PackagingSet "${set.name}" (${set.id}) must include at least one item`
    );
  }

  const seenItemIds = new Set<string>();

  for (const itemId of set.items) {
    if (!itemId.trim()) {
      throw new Error(
        `PackagingSet "${set.name}" (${set.id}) contains an empty item id`
      );
    }

    if (seenItemIds.has(itemId)) {
      throw new Error(
        `PackagingSet "${set.name}" (${set.id}) references duplicate item "${itemId}"`
      );
    }

    seenItemIds.add(itemId);

    if (!getPackagingItemById(itemId)) {
      throw new Error(
        `PackagingSet "${set.name}" (${set.id}) references unknown item "${itemId}"`
      );
    }
  }
}

function loadPackagingSets(): PackagingSet[] {
  if (!packagingSetCache) {
    const seenIds = new Set<string>();

    packagingSetCache = packagingSetSeeds.map((set) => {
      validatePackagingSetSeed(set);

      if (seenIds.has(set.id)) {
        throw new Error(`Duplicate packaging set id: "${set.id}"`);
      }

      seenIds.add(set.id);

      return {
        ...set,
        items: [...set.items],
      };
    });
  }

  return packagingSetCache;
}

export function getAllPackagingSets(): PackagingSet[] {
  return loadPackagingSets();
}

export function getPackagingSetById(id: string): PackagingSet | undefined {
  return loadPackagingSets().find((set) => set.id === id);
}

export function resetPackagingSetCache(): void {
  packagingSetCache = null;
}
