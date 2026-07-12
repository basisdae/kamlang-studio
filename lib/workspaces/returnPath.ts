/**
 * Pending path when Route Guard sends user to Chooser.
 * Cleared after Workspace selection (session only — not Business/Workspace prefs).
 */
export const RETURN_PATH_STORAGE_KEY = "bi.returnPath.v1";

export function saveReturnPath(pathname: string): void {
  if (typeof window === "undefined") return;
  if (!pathname || pathname === "/modes" || pathname.startsWith("/modes/")) {
    return;
  }
  try {
    sessionStorage.setItem(RETURN_PATH_STORAGE_KEY, pathname);
  } catch {
    /* ignore */
  }
}

export function consumeReturnPath(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const path = sessionStorage.getItem(RETURN_PATH_STORAGE_KEY);
    sessionStorage.removeItem(RETURN_PATH_STORAGE_KEY);
    return path;
  } catch {
    return null;
  }
}
