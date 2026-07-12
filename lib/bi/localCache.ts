/**
 * Opening / BI localStorage policy (v0.2.3+)
 *
 * Supabase is the single source of truth for business data.
 * localStorage may only hold UI preferences + a cache version marker.
 */

export const BI_CACHE_VERSION = 3;
export const BI_CACHE_VERSION_KEY = "bi.cache.version";
/** Shown once after a purge so the user knows why data reloaded */
export const BI_CACHE_MIGRATED_NOTICE_KEY = "bi.cache.migrated-notice.v3";

/** Explicit business / stale keys to remove (never rewrite). */
export const BI_BUSINESS_CACHE_KEYS = [
  "business-insight.assets.v2",
  "bi.tangtao.assets.v1",
  "bi.tangtao.assets.v2",
  "business-insight.budget.cache.v1",
  "business-insight.workspace.cache.v1",
  "business-insight.assets.imported-to-supabase.v1",
  "business-insight.assets-test-checklist.v1",
] as const;

/** Kitchen / Lab trial keys — cleared on clean-start cache bump */
export const KL_TRIAL_CACHE_KEYS = [
  "kl-purchase-states",
  "kl-production-plans",
  "kl-production-hidden-dates",
  "kl-inventory-adjustments",
  "kl-builder-recipes",
  "kl-builder-menus",
  "kl-user-master-recipes",
  "kl-user-master-ingredients",
  "kl-activity-log",
  "kl-version-history",
  "kl-staff-prep",
] as const;

/**
 * Allowed UI preference keys (Opening).
 * Keep this list short — anything else under bi.* / business-insight.* is purged.
 */
export const BI_UI_PREF_KEYS = [
  "bi.assets.view",
  "bi.activity.favorites",
  "bi.activity.pins",
  "bi.activity.comments",
  "bi.appWorkspace.v1",
  "bi.appWorkspace.v2",
  "bi.appWorkspace.v3",
  "bi.currentWorkspace.v1",
  "bi.currentBusiness.v1",
] as const;

const BUSINESS_PREFIXES = [
  "business-insight.assets",
  "business-insight.budget",
  "business-insight.workspace",
  "bi.tangtao.",
] as const;

export type BiCacheEnsureResult = {
  purged: boolean;
  versionMismatch: boolean;
  removedKeys: string[];
  /** True when we should show a one-time user notice */
  shouldNotify: boolean;
};

function isAllowedUiPref(key: string): boolean {
  return (BI_UI_PREF_KEYS as readonly string[]).includes(key);
}

function shouldPurgeKey(key: string): boolean {
  if (key === BI_CACHE_VERSION_KEY) return false;
  if (key === BI_CACHE_MIGRATED_NOTICE_KEY) return false;
  if (isAllowedUiPref(key)) return false;
  if ((BI_BUSINESS_CACHE_KEYS as readonly string[]).includes(key)) return true;
  if ((KL_TRIAL_CACHE_KEYS as readonly string[]).includes(key)) return true;
  if (BUSINESS_PREFIXES.some((p) => key.startsWith(p))) return true;
  // Any other bi.* / business-insight.* besides allowlist
  if (key.startsWith("bi.") || key.startsWith("business-insight.")) return true;
  return false;
}

/**
 * Ensure BI_CACHE_VERSION and strip business data from localStorage.
 * Safe to call on every client boot — idempotent after first run.
 */
export function ensureBiCacheVersion(): BiCacheEnsureResult {
  if (typeof window === "undefined") {
    return {
      purged: false,
      versionMismatch: false,
      removedKeys: [],
      shouldNotify: false,
    };
  }

  const stored = window.localStorage.getItem(BI_CACHE_VERSION_KEY);
  const versionMismatch = stored !== String(BI_CACHE_VERSION);
  const removedKeys: string[] = [];

  // Snapshot keys first — length changes while deleting
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const k = window.localStorage.key(i);
    if (k) keys.push(k);
  }

  for (const key of keys) {
    if (!shouldPurgeKey(key)) continue;
    window.localStorage.removeItem(key);
    removedKeys.push(key);
  }

  // Always pin known business + trial keys (even if already empty)
  for (const key of [...BI_BUSINESS_CACHE_KEYS, ...KL_TRIAL_CACHE_KEYS]) {
    if (window.localStorage.getItem(key) != null) {
      window.localStorage.removeItem(key);
      if (!removedKeys.includes(key)) removedKeys.push(key);
    }
  }

  const purged = versionMismatch || removedKeys.length > 0;
  window.localStorage.setItem(BI_CACHE_VERSION_KEY, String(BI_CACHE_VERSION));

  let shouldNotify = false;
  if (purged && removedKeys.length > 0) {
    const noticed =
      window.localStorage.getItem(BI_CACHE_MIGRATED_NOTICE_KEY) === "1";
    if (!noticed) {
      shouldNotify = true;
      window.localStorage.setItem(BI_CACHE_MIGRATED_NOTICE_KEY, "1");
    }
  }

  return { purged, versionMismatch, removedKeys, shouldNotify };
}

/** Remove Opening business caches only (no version bump). */
export function clearBiBusinessCaches(): string[] {
  if (typeof window === "undefined") return [];
  const removed: string[] = [];
  for (const key of BI_BUSINESS_CACHE_KEYS) {
    if (window.localStorage.getItem(key) != null) {
      window.localStorage.removeItem(key);
      removed.push(key);
    }
  }
  return removed;
}
