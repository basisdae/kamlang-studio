"use client";

import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import type { ModuleViewConfig } from "./types";

/**
 * Resolve view hints for a Platform Module from the active Workspace Context.
 * Modules must branch on this config — never on AppWorkspaceId.
 */
export function useModuleViewConfig(moduleId: string): ModuleViewConfig {
  const { config } = useAppWorkspace();
  return config?.moduleConfig?.[moduleId] ?? {};
}
