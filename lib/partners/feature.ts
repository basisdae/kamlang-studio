/**
 * Partners module gate.
 * Set true only after bi_partners exists AND Production UI QA passes.
 * When false: hidden from all user Navigation / Search / Landing links;
 * /partners is treated as out-of-workspace (WorkspaceGate redirects away).
 * Developers re-enable by flipping this flag.
 */
export const PARTNERS_MODULE_ENABLED = true;

export function isPartnersPath(pathname: string): boolean {
  return pathname === "/partners" || pathname.startsWith("/partners/");
}

/** Strip / rewrite Partners destinations when the module is off. */
export function resolvePartnersHref(href: string): string | null {
  if (!isPartnersPath(href)) return href;
  if (PARTNERS_MODULE_ENABLED) return href;
  return null;
}

export function partnersDevLog(message: string, detail?: unknown) {
  if (process.env.NODE_ENV === "development") {
    if (detail !== undefined) {
      console.info(`[Partners] ${message}`, detail);
    } else {
      console.info(`[Partners] ${message}`);
    }
  }
}
