/**
 * Packaging domain types (V2).
 *
 * PackagingItem = single material (กล่อง, ช้อน, ถุง).
 * PackagingSet = channel-specific bundle (Grab, LINE MAN, รับเอง, ทานร้าน).
 *
 * @see app/packaging/README.md
 */
export type PackagingItem = {
  id: string;
  name: string;
  category: string;
  cost: number;
  unit: string;
  active: boolean;
};

export type PackagingSet = {
  id: string;
  name: string;
  description: string;
  items: string[];
};

export type PackagingItemSeed = PackagingItem;
export type PackagingSetSeed = PackagingSet;

/**
 * @deprecated V1 model — use PackagingItem. Kept for PackagingRepository.
 */
export type Packaging = {
  id: string;
  name: string;
  cost: number;
  category: string;
  isActive: boolean;
};

/** @deprecated V1 seed — use PackagingItemSeed */
export type PackagingSeed = Packaging;
