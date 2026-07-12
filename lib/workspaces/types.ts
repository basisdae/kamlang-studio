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
  | "finance";

/** Master nav item ids (and future module keys). */
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

export type WorkspaceAccent =
  | "opening"
  | "operations"
  | "lab"
  | "marketing"
  | "finance";

export type AppWorkspaceConfig = {
  id: AppWorkspaceId;
  label: string;
  description: string;
  icon: LucideIcon;
  defaultLanding: string;
  /** Nav / module ids visible in this workspace. */
  visibleModules: ModuleId[] | "all";
  shortcuts: WorkspaceShortcut[];
  /** View hints passed into Platform Modules (never AppWorkspaceId) */
  moduleConfig?: Partial<Record<ModuleId, ModuleViewConfig>>;
  /** Soft accent for chooser / switcher / landing — icon + color, no emoji */
  accent: WorkspaceAccent;
};
