"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENT_WORKSPACE_STORAGE_KEY,
  getAppWorkspaceConfig,
  isAppWorkspaceId,
} from "../../lib/workspaces/appWorkspaces";
import type {
  AppWorkspaceConfig,
  AppWorkspaceId,
} from "../../lib/workspaces/types";

type AppWorkspaceContextValue = {
  /** false until localStorage read — avoid hydration mismatch */
  isHydrated: boolean;
  /** App work Context (Opening / Lab / …) — not Business / Tenant */
  currentWorkspace: AppWorkspaceId | null;
  config: AppWorkspaceConfig | null;
  isWorkspaceSelected: boolean;
  setWorkspace: (id: AppWorkspaceId) => void;
  clearWorkspace: () => void;
};

const AppWorkspaceContext = createContext<AppWorkspaceContextValue | null>(
  null
);

const LEGACY_WORKSPACE_KEYS = [
  "bi.appWorkspace.v1",
  "bi.appWorkspace.v2",
  "bi.appWorkspace.v3",
] as const;

function readStoredWorkspace(): AppWorkspaceId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_WORKSPACE_STORAGE_KEY);
    if (raw && isAppWorkspaceId(raw)) return raw;

    for (const key of LEGACY_WORKSPACE_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (legacy && isAppWorkspaceId(legacy)) {
        window.localStorage.setItem(CURRENT_WORKSPACE_STORAGE_KEY, legacy);
        window.localStorage.removeItem(key);
        return legacy;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function writeStoredWorkspace(id: AppWorkspaceId | null) {
  if (typeof window === "undefined") return;
  try {
    if (id == null) {
      window.localStorage.removeItem(CURRENT_WORKSPACE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(CURRENT_WORKSPACE_STORAGE_KEY, id);
    }
  } catch {
    /* preference only */
  }
}

/**
 * App Workspace = Context (Opening / Lab / Finance).
 * Storage is independent from currentBusiness (Tenant).
 */
export function AppWorkspaceProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] =
    useState<AppWorkspaceId | null>(null);

  useEffect(() => {
    setCurrentWorkspace(readStoredWorkspace());
    setIsHydrated(true);
  }, []);

  const setWorkspace = useCallback((id: AppWorkspaceId) => {
    setCurrentWorkspace(id);
    writeStoredWorkspace(id);
  }, []);

  const clearWorkspace = useCallback(() => {
    setCurrentWorkspace(null);
    writeStoredWorkspace(null);
  }, []);

  const value = useMemo<AppWorkspaceContextValue>(() => {
    const config = getAppWorkspaceConfig(currentWorkspace);
    return {
      isHydrated,
      currentWorkspace,
      config,
      isWorkspaceSelected: currentWorkspace != null,
      setWorkspace,
      clearWorkspace,
    };
  }, [isHydrated, currentWorkspace, setWorkspace, clearWorkspace]);

  return (
    <AppWorkspaceContext.Provider value={value}>
      {children}
    </AppWorkspaceContext.Provider>
  );
}

export function useAppWorkspace() {
  const ctx = useContext(AppWorkspaceContext);
  if (!ctx) {
    throw new Error("useAppWorkspace must be used within AppWorkspaceProvider");
  }
  return ctx;
}
