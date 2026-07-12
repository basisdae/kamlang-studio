import {
  getDesktopNavItems,
  getLegacyNavItems,
  getMobileMoreItems,
  getMobileTabItems,
  isNavActive,
  type NavigationItem,
} from "../../components/layout/navConfig";
import {
  ALWAYS_VISIBLE_NAV_IDS,
  WORKSPACE_LANDING_PATHS,
} from "./appWorkspaces";
import type { AppWorkspaceId, ModuleId } from "./types";

function allowedSet(visibleModules: ModuleId[] | "all"): Set<string> | "all" {
  if (visibleModules === "all") return "all";
  return new Set<string>([...visibleModules, ...ALWAYS_VISIBLE_NAV_IDS]);
}

function isAllowed(
  item: NavigationItem,
  allowed: Set<string> | "all"
): boolean {
  if (allowed === "all") return true;
  return allowed.has(item.id);
}

export function filterNavItems(
  items: NavigationItem[],
  visibleModules: ModuleId[] | "all"
): NavigationItem[] {
  const allowed = allowedSet(visibleModules);
  return items.filter((item) => isAllowed(item, allowed));
}

export function getWorkspaceDesktopNav(
  visibleModules: ModuleId[] | "all"
): NavigationItem[] {
  return filterNavItems(getDesktopNavItems(), visibleModules);
}

export function getWorkspaceMobileTabNav(
  visibleModules: ModuleId[] | "all"
): NavigationItem[] {
  const tabs = filterNavItems(getMobileTabItems(), visibleModules);
  const insight = getMobileTabItems().find((t) => t.id === "insight");
  if (insight && !tabs.some((t) => t.id === "insight")) {
    return [...tabs, insight];
  }
  return tabs;
}

export function getWorkspaceMobileMoreNav(
  visibleModules: ModuleId[] | "all"
): NavigationItem[] {
  return filterNavItems(getMobileMoreItems(), visibleModules);
}

export function getWorkspaceLegacyNav(
  visibleModules: ModuleId[] | "all"
): NavigationItem[] {
  if (visibleModules === "all") return getLegacyNavItems();
  return filterNavItems(getLegacyNavItems(), visibleModules);
}

function isWorkspaceLandingPath(
  pathname: string,
  workspaceId?: AppWorkspaceId | null
): boolean {
  if (!workspaceId) return false;
  const paths = WORKSPACE_LANDING_PATHS[workspaceId] ?? [];
  return paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * True if pathname belongs to a visible module (or always-on / public).
 * Pass workspaceId so default landings (/lab, /operations, …) stay in-workspace.
 */
export function isPathInWorkspace(
  pathname: string,
  visibleModules: ModuleId[] | "all",
  workspaceId?: AppWorkspaceId | null
): boolean {
  if (
    pathname.startsWith("/modes") ||
    pathname.startsWith("/insight") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/setup") ||
    pathname.startsWith("/status") ||
    pathname.startsWith("/auth")
  ) {
    return true;
  }

  if (isWorkspaceLandingPath(pathname, workspaceId)) {
    return true;
  }

  if (visibleModules === "all") return true;

  const allowed = allowedSet(visibleModules);
  const candidates = [...getDesktopNavItems(), ...getLegacyNavItems()];
  return candidates.some(
    (item) => isAllowed(item, allowed) && isNavActive(pathname, item.href)
  );
}
