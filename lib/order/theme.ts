/**
 * Order surface theme — persist light/dark for /order and /orders only.
 * Does not change Business Insight global theme.
 */

export type OrderThemeMode = "light" | "dark";

export const ORDER_THEME_STORAGE_KEY = "tangtao.order.theme.v1";

export function resolveInitialOrderTheme(): OrderThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = localStorage.getItem(ORDER_THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function persistOrderTheme(mode: OrderThemeMode): void {
  try {
    localStorage.setItem(ORDER_THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}
