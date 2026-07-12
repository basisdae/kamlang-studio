/**
 * Asset helpers for Opening.
 * Business rows are not persisted to localStorage (v0.2.3+ — Supabase SSoT).
 * Legacy key names remain for BI_CACHE_VERSION purge.
 */

import type { AssetItem, AssetStatus } from "../../../../data/seed/tangtao";

export const ASSETS_STORAGE_KEY_V1 = "bi.tangtao.assets.v1";
export const ASSETS_STORAGE_KEY_V2_LEGACY = "bi.tangtao.assets.v2";
export const ASSETS_STORAGE_KEY = "business-insight.assets.v2";
export const ASSETS_SCHEMA_VERSION = 2 as const;

export type AssetsStorageError =
  | "read_failed"
  | "write_failed"
  | "schema_invalid"
  | "empty_after_clear"
  | null;

const LEGACY_STATUS_MAP: Record<string, AssetStatus> = {
  no_price: "planned",
  awaiting_quote: "awaiting_quote",
  ready_to_buy: "ready_to_buy",
  purchased: "ordered",
  installed: "in_use",
};

export function normalizeAssetKeyPart(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function assetIdentityKey(input: {
  name: string;
  brand: string;
  model: string;
}) {
  return [
    normalizeAssetKeyPart(input.name),
    normalizeAssetKeyPart(input.brand),
    normalizeAssetKeyPart(input.model),
  ].join("|");
}

export function findSimilarAssets(
  assets: AssetItem[],
  input: { name: string; brand: string; model: string },
  excludeId?: string
) {
  const key = assetIdentityKey(input);
  if (!normalizeAssetKeyPart(input.name)) return [];
  return assets.filter((item) => {
    if (excludeId && item.id === excludeId) return false;
    return assetIdentityKey(item) === key;
  });
}

export function normalizeAsset(
  raw: Partial<AssetItem> & { id?: string }
): AssetItem | null {
  if (!raw || typeof raw !== "object") return null;
  if (!raw.id || typeof raw.id !== "string") return null;
  if (!raw.name || typeof raw.name !== "string") return null;

  const legacyStatus =
    typeof raw.status === "string" ? LEGACY_STATUS_MAP[raw.status] : undefined;
  const status = (legacyStatus ?? raw.status ?? "planned") as AssetStatus;

  return {
    id: raw.id,
    name: String(raw.name),
    category: typeof raw.category === "string" ? raw.category : "อื่นๆ",
    brand: typeof raw.brand === "string" ? raw.brand : "",
    model: typeof raw.model === "string" ? raw.model : "",
    quantity:
      typeof raw.quantity === "number" && raw.quantity > 0 ? raw.quantity : 1,
    unit: typeof raw.unit === "string" && raw.unit ? raw.unit : "ชิ้น",
    estimatedPrice:
      typeof raw.estimatedPrice === "number" ? raw.estimatedPrice : null,
    actualPrice: typeof raw.actualPrice === "number" ? raw.actualPrice : null,
    supplier: typeof raw.supplier === "string" ? raw.supplier : "",
    purchaseChannel: raw.purchaseChannel ?? "",
    purchaseUrl: typeof raw.purchaseUrl === "string" ? raw.purchaseUrl : "",
    priority: raw.priority ?? "must",
    status,
    requiredForOpening: raw.requiredForOpening ?? true,
    purchasedAt: raw.purchasedAt ?? null,
    size: raw.size ?? "",
    color: raw.color ?? "",
    material: raw.material ?? "",
    power: raw.power ?? "",
    specs: raw.specs ?? "",
    note: raw.note ?? "",
    warranty: raw.warranty ?? "",
    warrantyUntil: raw.warrantyUntil ?? null,
    serialNumber: raw.serialNumber ?? "",
    imageUrl: raw.imageUrl ?? null,
    documentIds: Array.isArray(raw.documentIds) ? raw.documentIds : [],
    decisionGroupId: raw.decisionGroupId ?? null,
    purchaseHistory: Array.isArray(raw.purchaseHistory)
      ? raw.purchaseHistory
      : [],
    repairHistory: Array.isArray(raw.repairHistory) ? raw.repairHistory : [],
  };
}

/** @deprecated No-op — Supabase is SSoT */
export function loadAssetsCacheOnly(): {
  assets: AssetItem[];
  hit: boolean;
  error: AssetsStorageError;
} {
  return { assets: [], hit: false, error: null };
}

/** @deprecated No-op */
export function persistAssets(_assets: AssetItem[]): {
  ok: boolean;
  error: AssetsStorageError;
} {
  return { ok: true, error: null };
}

export function clearAssetsStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ASSETS_STORAGE_KEY);
    window.localStorage.removeItem(ASSETS_STORAGE_KEY_V2_LEGACY);
    window.localStorage.removeItem(ASSETS_STORAGE_KEY_V1);
  } catch {
    /* ignore */
  }
}
