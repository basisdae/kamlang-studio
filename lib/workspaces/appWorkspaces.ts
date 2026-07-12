/**
 * App Workspace registry — Context only (not Module owners, not Route owners).
 * Modules belong to Platform; Workspace selects which to use.
 */

import {
  FlaskConical,
  Map,
  Megaphone,
  Store,
  Wallet,
} from "lucide-react";
import type { AppWorkspaceConfig, AppWorkspaceId } from "./types";

/**
 * Always-on nav — Insight is Observer layer, not a Workspace.
 */
export const ALWAYS_VISIBLE_NAV_IDS = [
  "insight",
  "settings",
  "search",
] as const;

/** App Workspace Context only — not Business / Tenant */
export const CURRENT_WORKSPACE_STORAGE_KEY = "bi.currentWorkspace.v1";
/** @deprecated migrated → CURRENT_WORKSPACE_STORAGE_KEY */
export const APP_WORKSPACE_STORAGE_KEY = CURRENT_WORKSPACE_STORAGE_KEY;

/** Choose Workspace Hub — not a Workspace */
export const WORKSPACE_CHOOSER_PATH = "/modes";

/** Platform Landing Composition entry (non-Opening workspaces) */
export const PLATFORM_LANDING_PATH = "/home";

/**
 * Exclusive landing paths per workspace (for switcher / in-workspace checks).
 * Shared /home is listed for each non-Opening workspace — path alone does not imply owner.
 */
export const WORKSPACE_LANDING_PATHS: Record<AppWorkspaceId, string[]> = {
  opening: ["/opening"],
  operations: [PLATFORM_LANDING_PATH],
  lab: [PLATFORM_LANDING_PATH],
  marketing: [PLATFORM_LANDING_PATH],
  finance: [PLATFORM_LANDING_PATH],
};

const OPENING_MODULES = [
  "overview",
  "opening-checklist",
  "opening-budget",
  "opening-assets",
  "opening-documents",
  "opening-calendar",
  "opening-procurement",
] as const;

const OPERATIONS_MODULES = [
  "overview",
  "purchase",
  "ingredients",
  "inventory",
  "production",
  "opening-documents",
  "opening-procurement",
  "today-ops",
] as const;

const LAB_MODULES = [
  "overview",
  "recipes",
  "ingredients",
  "recipe-builder",
  "costing",
] as const;

const MARKETING_MODULES = [
  "overview",
  "opening-checklist",
  "timeline",
  "opening-documents",
] as const;

const FINANCE_MODULES = [
  "overview",
  "opening-budget",
  "partners",
  "quotes",
  "decisions",
] as const;

export const APP_WORKSPACES: Record<AppWorkspaceId, AppWorkspaceConfig> = {
  opening: {
    id: "opening",
    label: "ก่อตั้งธุรกิจ",
    description: "เตรียมเปิดร้าน รายการ งบ อุปกรณ์ และเอกสาร",
    icon: Map,
    defaultLanding: "/opening",
    visibleModules: [...OPENING_MODULES],
    shortcuts: [
      { label: "รายการเตรียมเปิดร้าน", href: "/opening/checklist" },
      { label: "งบประมาณ", href: "/opening/budget" },
    ],
    accent: "opening",
    moduleConfig: {
      "opening-budget": { summaryMode: "opening" },
    },
  },
  operations: {
    id: "operations",
    label: "ดำเนินกิจการ",
    description: "จัดซื้อ สต๊อก ผลิต และงานประจำวัน",
    icon: Store,
    defaultLanding: PLATFORM_LANDING_PATH,
    visibleModules: [...OPERATIONS_MODULES],
    shortcuts: [
      { label: "จัดซื้อ", href: "/purchase" },
      { label: "แผนผลิต", href: "/production" },
    ],
    accent: "operations",
  },
  lab: {
    id: "lab",
    label: "วิจัยและพัฒนา",
    description: "สูตร วัตถุดิบ และต้นทุนเมนู",
    icon: FlaskConical,
    defaultLanding: PLATFORM_LANDING_PATH,
    visibleModules: [...LAB_MODULES],
    shortcuts: [
      { label: "สูตร", href: "/recipes" },
      { label: "สร้างสูตร", href: "/recipes/builder" },
    ],
    accent: "lab",
  },
  marketing: {
    id: "marketing",
    label: "การตลาด",
    description: "Marketing Readiness — เตรียมความพร้อมก่อนเปิดการตลาด",
    icon: Megaphone,
    defaultLanding: PLATFORM_LANDING_PATH,
    visibleModules: [...MARKETING_MODULES],
    shortcuts: [
      { label: "รายการเตรียมการตลาด", href: "/opening/checklist" },
      { label: "หน้าร้าน", href: "/opening/checklist/mkt-storefront" },
    ],
    accent: "marketing",
    moduleConfig: {
      "opening-checklist": {
        summaryMode: "marketing",
        visibleSections: [
          "mkt-storefront",
          "mkt-online",
          "mkt-branding",
          "mkt-print",
          "mkt-promotion",
          "mkt-content",
        ],
      },
    },
  },
  finance: {
    id: "finance",
    label: "การเงิน",
    description: "งบ Partners Quotes และมุมเงินที่มีอยู่",
    icon: Wallet,
    defaultLanding: PLATFORM_LANDING_PATH,
    visibleModules: [...FINANCE_MODULES],
    shortcuts: [
      { label: "งบประมาณ", href: "/opening/budget" },
      { label: "Partners", href: "/partners" },
    ],
    accent: "finance",
    moduleConfig: {
      "opening-budget": {
        summaryMode: "finance",
        defaultFilter: "need",
      },
    },
  },
};

/** Workspaces only — Explorer Hub is /modes, not listed here */
export const APP_WORKSPACE_LIST: AppWorkspaceConfig[] = [
  APP_WORKSPACES.opening,
  APP_WORKSPACES.operations,
  APP_WORKSPACES.lab,
  APP_WORKSPACES.marketing,
  APP_WORKSPACES.finance,
];

export function getAppWorkspaceConfig(
  id: AppWorkspaceId | null
): AppWorkspaceConfig | null {
  if (!id) return null;
  return APP_WORKSPACES[id] ?? null;
}

export function isAppWorkspaceId(value: string): value is AppWorkspaceId {
  return value in APP_WORKSPACES;
}

/** True for Platform / Opening landing composition paths */
export function isLandingCompositionPath(pathname: string): boolean {
  return (
    pathname === PLATFORM_LANDING_PATH ||
    pathname === "/opening" ||
    pathname === WORKSPACE_CHOOSER_PATH
  );
}

/**
 * Exclusive Opening landing only — /home is shared Platform entry
 * (owner comes from AppWorkspace context, not the URL).
 */
export function getWorkspaceIdForLandingPath(
  pathname: string
): AppWorkspaceId | null {
  if (pathname === "/opening" || pathname.startsWith("/opening/")) {
    // Only exact /opening is Opening Landing; module paths under /opening/* are Modules
    if (pathname === "/opening") return "opening";
    return null;
  }
  return null;
}
