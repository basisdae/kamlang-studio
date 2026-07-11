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
import { getSupabaseEnvStatus } from "../../lib/supabase/env";
import { getBrowserOnline } from "../../lib/supabase/service";
import { biDevError, userFacingMessage } from "../../lib/supabase/errors";
import { workspaceService } from "../../lib/services/workspaceService";
import type { Workspace } from "../../lib/types/workspace";
import type { DataSource } from "../../components/bi/dataSource";

const CACHE_KEY = "business-insight.workspace.cache.v1";

type WorkspaceContextValue = {
  workspace: Workspace | null;
  workspaceId: string;
  workspaceName: string;
  ready: boolean;
  loading: boolean;
  configured: boolean;
  online: boolean;
  browserOffline: boolean;
  error: string | null;
  dataSource: DataSource;
  retry: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function readCache(): Workspace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Workspace) : null;
  } catch {
    return null;
  }
}

function writeCache(ws: Workspace) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(ws));
  } catch {
    /* ignore */
  }
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const configured = getSupabaseEnvStatus().configured;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(configured);
  const [ready, setReady] = useState(!configured);
  const [online, setOnline] = useState(false);
  const [browserOffline, setBrowserOffline] = useState(false);
  const [error, setError] = useState<string | null>(
    configured ? null : getSupabaseEnvStatus().error
  );

  const load = useCallback(async () => {
    const env = getSupabaseEnvStatus();
    setBrowserOffline(!getBrowserOnline());

    if (!env.configured) {
      setError(env.error);
      setOnline(false);
      setWorkspace(readCache());
      setLoading(false);
      setReady(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ws = await workspaceService.getCurrentWorkspace();
      setWorkspace(ws);
      writeCache(ws);
      setOnline(true);
    } catch (e) {
      biDevError("WorkspaceProvider", "getCurrentWorkspace", e);
      setError(userFacingMessage(e));
      setOnline(false);
      setWorkspace(readCache());
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate workspace via service */
  useEffect(() => {
    void load();
    const onOnline = () => {
      setBrowserOffline(false);
      void load();
    };
    const onOffline = () => setBrowserOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const value = useMemo<WorkspaceContextValue>(() => {
    let dataSource: DataSource = "seed";
    if (!configured) dataSource = "seed";
    else if (loading) dataSource = "sample";
    else if (online) dataSource = "real";
    else dataSource = "seed";

    return {
      workspace,
      workspaceId: workspace?.id ?? "11111111-1111-1111-1111-111111111111",
      workspaceName: workspace?.name ?? "ตั้งเตา",
      ready,
      loading,
      configured,
      online,
      browserOffline,
      error,
      dataSource,
      retry: load,
    };
  }, [
    workspace,
    ready,
    loading,
    configured,
    online,
    browserOffline,
    error,
    load,
  ]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
}
