/**
 * Business / Tenant preference storage — independent from App Workspace Context.
 * Switching Business must not clear currentWorkspace.
 */

export const CURRENT_BUSINESS_STORAGE_KEY = "bi.currentBusiness.v1";

/** Default Business until multi-tenant picker exists */
export const DEFAULT_BUSINESS_SLUG = "tangtao";
export const DEFAULT_BUSINESS_NAME = "ตั้งเตา";

export type StoredBusinessPreference = {
  /** bi_workspaces.id when known */
  id: string | null;
  /** bi_workspaces.slug */
  slug: string;
  /** Display name cache (UI only) */
  name: string;
};

export function readStoredBusiness(): StoredBusinessPreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_BUSINESS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredBusinessPreference>;
    if (!parsed || typeof parsed.slug !== "string" || !parsed.slug.trim()) {
      return null;
    }
    return {
      id: typeof parsed.id === "string" ? parsed.id : null,
      slug: parsed.slug.trim(),
      name:
        typeof parsed.name === "string" && parsed.name.trim()
          ? parsed.name.trim()
          : DEFAULT_BUSINESS_NAME,
    };
  } catch {
    return null;
  }
}

export function writeStoredBusiness(
  preference: StoredBusinessPreference | null
): void {
  if (typeof window === "undefined") return;
  try {
    if (preference == null) {
      window.localStorage.removeItem(CURRENT_BUSINESS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      CURRENT_BUSINESS_STORAGE_KEY,
      JSON.stringify(preference)
    );
  } catch {
    /* preference only */
  }
}

export function defaultBusinessPreference(): StoredBusinessPreference {
  return {
    id: null,
    slug: DEFAULT_BUSINESS_SLUG,
    name: DEFAULT_BUSINESS_NAME,
  };
}
