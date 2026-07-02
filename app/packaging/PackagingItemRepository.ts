/**
 * Read-only repository for PackagingItem materials.
 *
 * @see app/packaging/README.md
 */
import { getPackagingItemSeeds } from "./itemSeed";
import type { PackagingItem, PackagingItemSeed } from "./types";

let packagingItemCache: PackagingItem[] | null = null;

function validatePackagingItemSeed(item: PackagingItemSeed): void {
  if (!item.id.trim()) {
    throw new Error("PackagingItem id must not be empty");
  }

  if (!item.name.trim()) {
    throw new Error(`PackagingItem "${item.id}" must have a non-empty name`);
  }

  if (!item.category.trim()) {
    throw new Error(
      `PackagingItem "${item.name}" (${item.id}) must have a category`
    );
  }

  if (!item.unit.trim()) {
    throw new Error(
      `PackagingItem "${item.name}" (${item.id}) must have a unit`
    );
  }

  if (!Number.isFinite(item.cost) || item.cost < 0) {
    throw new Error(
      `PackagingItem "${item.name}" (${item.id}) must have cost >= 0`
    );
  }

  if (typeof item.active !== "boolean") {
    throw new Error(
      `PackagingItem "${item.name}" (${item.id}) must have active boolean`
    );
  }
}

function loadPackagingItems(): PackagingItem[] {
  if (!packagingItemCache) {
    const seenIds = new Set<string>();

    packagingItemCache = getPackagingItemSeeds().map((item) => {
      validatePackagingItemSeed(item);

      if (seenIds.has(item.id)) {
        throw new Error(`Duplicate packaging item id: "${item.id}"`);
      }

      seenIds.add(item.id);

      return { ...item };
    });
  }

  return packagingItemCache;
}

export function getAllPackagingItems(): PackagingItem[] {
  return loadPackagingItems();
}

export function getPackagingItemById(id: string): PackagingItem | undefined {
  return loadPackagingItems().find((item) => item.id === id);
}

export function resetPackagingItemCache(): void {
  packagingItemCache = null;
}
