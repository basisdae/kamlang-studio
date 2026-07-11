/**
 * Assets localStorage — schema versioned for Tang Tao trial.
 * Ready to swap for Supabase later (same AssetItem shape).
 */

import {
  SEED_ASSETS,
  type AssetItem,
  type AssetStatus,
} from "../../../../data/seed/tangtao";

export const ASSETS_STORAGE_KEY_V1 = "bi.tangtao.assets.v1";
/** Legacy v2 array-only key from earlier sprint */
export const ASSETS_STORAGE_KEY_V2_LEGACY = "bi.tangtao.assets.v2";
/** Canonical key */
export const ASSETS_STORAGE_KEY = "business-insight.assets.v2";
export const ASSETS_SCHEMA_VERSION = 2 as const;

export type AssetsStorageEnvelope = {
  schemaVersion: typeof ASSETS_SCHEMA_VERSION;
  updatedAt: string;
  assets: AssetItem[];
};

export type AssetsLoadResult = {
  assets: AssetItem[];
  source: "seed" | "storage" | "migrated";
  error: AssetsStorageError | null;
};

export type AssetsStorageError =
  | "read_failed"
  | "write_failed"
  | "schema_invalid"
  | "empty_after_clear";

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

export function normalizeAsset(raw: Partial<AssetItem> & { id?: string }): AssetItem | null {
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

function migrateAssetArray(raw: unknown): AssetItem[] | null {
  if (!Array.isArray(raw)) return null;
  const assets: AssetItem[] = [];
  for (const row of raw) {
    const item = normalizeAsset(row as Partial<AssetItem>);
    if (item) assets.push(item);
  }
  return assets.length > 0 ? assets : null;
}

function parseEnvelope(raw: string): {
  assets: AssetItem[] | null;
  invalid: boolean;
} {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const assets = migrateAssetArray(parsed);
      return { assets, invalid: assets == null };
    }
    if (parsed && typeof parsed === "object") {
      const env = parsed as Partial<AssetsStorageEnvelope>;
      if (env.schemaVersion === 2 && Array.isArray(env.assets)) {
        const assets = migrateAssetArray(env.assets);
        return { assets, invalid: assets == null };
      }
      if (Array.isArray((parsed as { assets?: unknown }).assets)) {
        const assets = migrateAssetArray(
          (parsed as { assets: unknown[] }).assets
        );
        return { assets, invalid: assets == null };
      }
      return { assets: null, invalid: true };
    }
    return { assets: null, invalid: true };
  } catch {
    return { assets: null, invalid: true };
  }
}

function seedAssets() {
  return structuredClone(SEED_ASSETS).map((a) => normalizeAsset(a)!);
}

/**
 * Cache-only read — never falls back to Tang Tao seed.
 * Used by online AssetProvider (Supabase is SoT).
 */
export function loadAssetsCacheOnly(): {
  assets: AssetItem[];
  hit: boolean;
  error: AssetsStorageError | null;
} {
  if (typeof window === "undefined") {
    return { assets: [], hit: false, error: null };
  }
  try {
    const raw = window.localStorage.getItem(ASSETS_STORAGE_KEY);
    if (!raw) return { assets: [], hit: false, error: null };
    const { assets, invalid } = parseEnvelope(raw);
    if (invalid) return { assets: [], hit: false, error: "schema_invalid" };
    if (assets) return { assets, hit: true, error: null };
    return { assets: [], hit: false, error: null };
  } catch {
    return { assets: [], hit: false, error: "read_failed" };
  }
}

/** @deprecated Prefer loadAssetsCacheOnly for online mode — may return seed */
export function loadAssetsFromStorage(): AssetsLoadResult {
  if (typeof window === "undefined") {
    return { assets: seedAssets(), source: "seed", error: null };
  }

  try {
    const canonical = window.localStorage.getItem(ASSETS_STORAGE_KEY);
    if (canonical) {
      const { assets, invalid } = parseEnvelope(canonical);
      if (invalid) {
        return {
          assets: seedAssets(),
          source: "seed",
          error: "schema_invalid",
        };
      }
      if (assets) {
        return { assets, source: "storage", error: null };
      }
    }

    const legacyV2 = window.localStorage.getItem(ASSETS_STORAGE_KEY_V2_LEGACY);
    if (legacyV2) {
      const { assets, invalid } = parseEnvelope(legacyV2);
      if (assets) {
        persistAssets(assets);
        window.localStorage.removeItem(ASSETS_STORAGE_KEY_V2_LEGACY);
        return { assets, source: "migrated", error: null };
      }
      if (invalid) {
        return {
          assets: seedAssets(),
          source: "seed",
          error: "schema_invalid",
        };
      }
    }

    const legacyV1 = window.localStorage.getItem(ASSETS_STORAGE_KEY_V1);
    if (legacyV1) {
      const { assets, invalid } = parseEnvelope(legacyV1);
      if (assets) {
        persistAssets(assets);
        window.localStorage.removeItem(ASSETS_STORAGE_KEY_V1);
        return { assets, source: "migrated", error: null };
      }
      if (invalid) {
        return {
          assets: seedAssets(),
          source: "seed",
          error: "schema_invalid",
        };
      }
    }

    return { assets: seedAssets(), source: "seed", error: null };
  } catch {
    return { assets: seedAssets(), source: "seed", error: "read_failed" };
  }
}

export function persistAssets(assets: AssetItem[]): {
  ok: boolean;
  error: AssetsStorageError | null;
} {
  if (typeof window === "undefined") {
    return { ok: true, error: null };
  }
  const envelope: AssetsStorageEnvelope = {
    schemaVersion: ASSETS_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    assets,
  };
  try {
    window.localStorage.setItem(ASSETS_STORAGE_KEY, JSON.stringify(envelope));
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "write_failed" };
  }
}

export function clearAssetsStorage(): {
  ok: boolean;
  error: AssetsStorageError | null;
} {
  if (typeof window === "undefined") {
    return { ok: true, error: null };
  }
  try {
    window.localStorage.removeItem(ASSETS_STORAGE_KEY);
    window.localStorage.removeItem(ASSETS_STORAGE_KEY_V2_LEGACY);
    window.localStorage.removeItem(ASSETS_STORAGE_KEY_V1);
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "write_failed" };
  }
}

export function getSeedAssetsCopy() {
  return seedAssets();
}

export const STATUSES_NEED_ACTUAL_PRICE: AssetStatus[] = [
  "ordered",
  "awaiting_delivery",
  "received",
  "in_use",
];
