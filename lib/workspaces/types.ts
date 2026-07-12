import type { LucideIcon } from "lucide-react";

/**
 * App Workspace (presentation “door”) — not ShopWorkspace / bi_workspaces tenant.
 * Modules must not import AppWorkspaceId for branching.
 */
export type AppWorkspaceId =
  | "opening"
  | "operations"
  | "lab"
  | "marketing"
  | "finance"
  | "explorer";

/** Master nav item ids (and future module keys). Explorer = all. */
export type ModuleId = string;

export type WorkspaceShortcut = {
  label: string;
  href: string;
};

/**
 * Optional view hints Workspace may pass into Modules later.
 * Modules consume these props — never AppWorkspaceId.
 */
export type ModuleViewConfig = {
  visibleSections?: string[];
  defaultFilter?: string;
  allowedActions?: string[];
  summaryMode?: string;
};

export type AppWorkspaceConfig = {
  id: AppWorkspaceId;
  label: string;
  /** Short mark for compact switcher (single grapheme / emoji) */
  mark: string;
  description: string;
  icon: LucideIcon;
  defaultLanding: string;
  /** Nav / module ids visible in this workspace. Empty + explorer flag via id. */
  visibleModules: ModuleId[] | "all";
  shortcuts: WorkspaceShortcut[];
  /** Optional per-module view config (P0: mostly unused) */
  moduleConfig?: Partial<Record<ModuleId, ModuleViewConfig>>;
  /** Soft accent token name for chooser card */
  accent?: "lemon" | "neutral";
};
