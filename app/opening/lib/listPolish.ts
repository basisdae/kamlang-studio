/**
 * Shared list polish — search + sort for Opening asset-backed lists.
 * No workflow / pricing changes.
 */

import {
  ASSET_STATUS_FLOW,
  type AssetItem,
  type AssetStatus,
} from "../../../data/seed/tangtao";

export type ListSortKey = "name" | "status" | "price" | "created";

export const LIST_SORT_OPTIONS: { value: ListSortKey; label: string }[] = [
  { value: "name", label: "ชื่อ" },
  { value: "status", label: "สถานะ" },
  { value: "price", label: "ราคา" },
  { value: "created", label: "วันที่สร้าง" },
];

const STATUS_ORDER = new Map(
  ASSET_STATUS_FLOW.map((s, i) => [s, i] as const)
);

export function assetSearchHaystack(item: {
  name?: string;
  note?: string;
  notes?: string;
  supplier?: string;
  brand?: string;
  model?: string;
  category?: string;
}): string {
  return [
    item.name,
    item.note,
    item.notes,
    item.supplier,
    item.brand,
    item.model,
    item.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesAssetSearch(
  item: Parameters<typeof assetSearchHaystack>[0],
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return assetSearchHaystack(item).includes(q);
}

function assetUnitPrice(item: AssetItem): number {
  return item.actualPrice ?? item.estimatedPrice ?? -1;
}

function assetCreatedMs(item: AssetItem): number {
  const raw = item.createdAt ?? item.purchasedAt ?? "";
  const t = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(t) ? t : 0;
}

export function sortAssets(
  items: AssetItem[],
  sort: ListSortKey
): AssetItem[] {
  const next = [...items];
  next.sort((a, b) => {
    switch (sort) {
      case "status": {
        const sa = STATUS_ORDER.get(a.status as AssetStatus) ?? 99;
        const sb = STATUS_ORDER.get(b.status as AssetStatus) ?? 99;
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name, "th");
      }
      case "price": {
        const pa = assetUnitPrice(a);
        const pb = assetUnitPrice(b);
        if (pa !== pb) return pb - pa;
        return a.name.localeCompare(b.name, "th");
      }
      case "created": {
        const ca = assetCreatedMs(a);
        const cb = assetCreatedMs(b);
        if (ca !== cb) return cb - ca;
        return a.name.localeCompare(b.name, "th");
      }
      case "name":
      default:
        return a.name.localeCompare(b.name, "th");
    }
  });
  return next;
}

export function matchesTextSearch(
  fields: Array<string | null | undefined>,
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(q);
}
