/**
 * Read-only repository for Packaging supplies.
 *
 * Data flow:
 *   PackagingRepository → MenuRepository (via packagingId)
 *
 * Packaging is reusable — one item can be used by many menus.
 *
 * @see app/packaging/README.md
 */
import { getPackagingSeeds } from "./seed";
import type { Packaging, PackagingSeed } from "./types";

let packagingCache: Packaging[] | null = null;

function validatePackagingSeed(packaging: PackagingSeed): void {
  if (!packaging.id.trim()) {
    throw new Error("Packaging id must not be empty");
  }

  if (!packaging.name.trim()) {
    throw new Error(
      `Packaging "${packaging.id}" must have a non-empty name`
    );
  }

  if (!packaging.category.trim()) {
    throw new Error(
      `Packaging "${packaging.name}" (${packaging.id}) must have a category`
    );
  }

  if (!Number.isFinite(packaging.cost) || packaging.cost < 0) {
    throw new Error(
      `Packaging "${packaging.name}" (${packaging.id}) must have cost >= 0`
    );
  }

  if (typeof packaging.isActive !== "boolean") {
    throw new Error(
      `Packaging "${packaging.name}" (${packaging.id}) must have isActive boolean`
    );
  }
}

function loadPackaging(): Packaging[] {
  if (!packagingCache) {
    const seenIds = new Set<string>();

    packagingCache = getPackagingSeeds().map((packaging) => {
      validatePackagingSeed(packaging);

      if (seenIds.has(packaging.id)) {
        throw new Error(`Duplicate packaging id: "${packaging.id}"`);
      }

      seenIds.add(packaging.id);

      return { ...packaging };
    });
  }

  return packagingCache;
}

export function getAllPackaging(): Packaging[] {
  return loadPackaging();
}

export function getPackagingById(id: string): Packaging | undefined {
  return loadPackaging().find((packaging) => packaging.id === id);
}

export function resetPackagingCache(): void {
  packagingCache = null;
}
