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
import { biRuntimeError, userFacingMessage } from "../../lib/supabase/errors";
import { workspaceService } from "../../lib/services/workspaceService";
import type { Workspace } from "../../lib/types/workspace";
import type { DataSource } from "../../components/bi/dataSource";

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

const FALLBACK_WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";

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
      setWorkspace(null);
      setLoading(false);
      setReady(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ws = await workspaceService.getCurrentWorkspace();
      setWorkspace(ws);
      setOnline(true);
    } catch (e) {
      biRuntimeError("WorkspaceProvider", "getCurrentWorkspace", e, {
        table: "bi_workspaces",
      });
      setError(userFacingMessage(e));
      setOnline(false);
      // No localStorage fallback — Supabase is SSoT
      setWorkspace(null);
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
    // Never label live Opening OS as "seed" — seed Overview retired from `/`
    let dataSource: DataSource = "sample";
    if (!configured) dataSource = "sample";
    else if (loading) dataSource = "sample";
    else if (online) dataSource = "real";
    else dataSource = "sample";

    return {
      workspace,
      workspaceId: workspace?.id ?? FALLBACK_WORKSPACE_ID,
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
