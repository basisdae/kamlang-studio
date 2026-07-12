/**
 * App Workspace registry — presentation doors only.
 * Modules must not branch on AppWorkspaceId.
 */

import {
  FlaskConical,
  LayoutGrid,
  Map,
  Megaphone,
  Store,
  Wallet,
} from "lucide-react";
import type { AppWorkspaceConfig, AppWorkspaceId } from "./types";

/**
 * Nav item ids always available (Command Center + utility).
 * Insight is NOT a Workspace.
 */
export const ALWAYS_VISIBLE_NAV_IDS = [
  "insight",
  "settings",
  "search",
] as const;

export const APP_WORKSPACE_STORAGE_KEY = "bi.appWorkspace.v2";

/** Landing paths that belong to a workspace even before nav rewrite. */
export const WORKSPACE_LANDING_PATHS: Record<AppWorkspaceId, string[]> = {
  opening: ["/opening"],
  operations: ["/operations", "/ops"],
  lab: ["/lab"],
  marketing: ["/marketing"],
  finance: ["/finance"],
  explorer: ["/explorer"],
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
  "timeline",
  "opening-documents",
  "opening-calendar",
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
    mark: "🚀",
    description: "เตรียมเปิดร้าน รายการ งบ อุปกรณ์ และเอกสาร",
    icon: Map,
    defaultLanding: "/opening",
    visibleModules: [...OPENING_MODULES],
    shortcuts: [
      { label: "รายการเตรียมเปิดร้าน", href: "/opening/checklist" },
      { label: "งบประมาณ", href: "/opening/budget" },
    ],
    accent: "lemon",
  },
  operations: {
    id: "operations",
    label: "ดำเนินกิจการ",
    mark: "🏪",
    description: "จัดซื้อ สต๊อก ผลิต และงานประจำวัน",
    icon: Store,
    defaultLanding: "/operations",
    visibleModules: [...OPERATIONS_MODULES],
    shortcuts: [
      { label: "จัดซื้อ", href: "/purchase" },
      { label: "แผนผลิต", href: "/production" },
    ],
    accent: "neutral",
  },
  lab: {
    id: "lab",
    label: "วิจัยและพัฒนา",
    mark: "🧪",
    description: "สูตร วัตถุดิบ และต้นทุนเมนู",
    icon: FlaskConical,
    defaultLanding: "/lab",
    visibleModules: [...LAB_MODULES],
    shortcuts: [
      { label: "สูตร", href: "/recipes" },
      { label: "สร้างสูตร", href: "/recipes/builder" },
    ],
    accent: "neutral",
  },
  marketing: {
    id: "marketing",
    label: "การตลาด",
    mark: "📣",
    description: "พื้นที่การตลาดกำลังเริ่มต้น",
    icon: Megaphone,
    defaultLanding: "/marketing",
    visibleModules: [...MARKETING_MODULES],
    shortcuts: [{ label: "ไทม์ไลน์", href: "/timeline" }],
    accent: "neutral",
  },
  finance: {
    id: "finance",
    label: "การเงิน",
    mark: "💰",
    description: "งบ Partners Quotes และมุมเงินที่มีอยู่",
    icon: Wallet,
    defaultLanding: "/finance",
    visibleModules: [...FINANCE_MODULES],
    shortcuts: [
      { label: "งบประมาณ", href: "/opening/budget" },
      { label: "Partners", href: "/partners" },
    ],
    accent: "neutral",
  },
  explorer: {
    id: "explorer",
    label: "แสดงทุกพื้นที่",
    mark: "🌍",
    description: "เปิดทุกเมนูในระบบ — สำรวจทั้งแพลตฟอร์ม",
    icon: LayoutGrid,
    defaultLanding: "/explorer",
    visibleModules: "all",
    shortcuts: [
      { label: "เปิดร้าน", href: "/opening" },
      { label: "Business Insight", href: "/insight" },
    ],
    accent: "lemon",
  },
};

export const APP_WORKSPACE_LIST: AppWorkspaceConfig[] = [
  APP_WORKSPACES.opening,
  APP_WORKSPACES.operations,
  APP_WORKSPACES.lab,
  APP_WORKSPACES.marketing,
  APP_WORKSPACES.finance,
  APP_WORKSPACES.explorer,
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

export function getWorkspaceIdForLandingPath(
  pathname: string
): AppWorkspaceId | null {
  for (const [id, paths] of Object.entries(WORKSPACE_LANDING_PATHS)) {
    if (paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      return id as AppWorkspaceId;
    }
  }
  return null;
}
