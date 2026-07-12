"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  isAssetOwned as seedIsAssetOwned,
  isAssetPlannedSpend,
  type AssetDecisionGroup,
  type AssetItem,
  type AssetPurchaseRecord,
  type AssetRepairRecord,
  type AssetStatus,
} from "../../data/seed/tangtao";
import { getSupabaseEnvStatus } from "../../lib/supabase/env";
import { getBrowserOnline } from "../../lib/supabase/service";
import { biRuntimeError, userFacingMessage } from "../../lib/supabase/errors";
import { assetService } from "../../lib/services/assetService";
import {
  assetToUiItem,
  decisionGroupToUi,
} from "../../lib/mappers/uiAdapters";
import { findSimilarAssets } from "../opening/assets/lib/assetsStorage";
import { buildOpeningSummary } from "../opening/lib/openingDomain";
import { useWorkspace } from "./WorkspaceProvider";
import { useAuth } from "../auth/AuthProvider";
import { showInfoToast } from "../lib/biInfoToast";

type MuteOpts = { silent?: boolean };

type AssetContextValue = {
  assets: AssetItem[];
  decisionGroups: AssetDecisionGroup[];
  ready: boolean;
  loading: boolean;
  saving: boolean;
  mode: "online" | "offline";
  online: boolean;
  configured: boolean;
  browserOffline: boolean;
  /** @deprecated No business data in localStorage — always null */
  storageError: null;
  storageKey: string;
  schemaVersion: number;
  error: string | null;
  warning: string | null;
  /** @deprecated Local import removed — always false */
  canImportLocal: boolean;
  getById: (id: string) => AssetItem | null;
  addAsset: (item: Omit<AssetItem, "id">) => Promise<AssetItem | null>;
  updateAsset: (
    id: string,
    patch: Partial<AssetItem>
  ) => Promise<AssetItem | null>;
  duplicateAsset: (
    id: string,
    overrides?: Partial<AssetItem>
  ) => Promise<AssetItem | null>;
  addPurchaseRound: (
    id: string,
    round: Omit<AssetPurchaseRecord, "id" | "assetId">
  ) => Promise<AssetItem | null>;
  addRepairRecord: (
    id: string,
    repair: Omit<AssetRepairRecord, "id" | "assetId">
  ) => Promise<AssetItem | null>;
  setStatus: (id: string, status: AssetStatus) => Promise<void>;
  archiveAsset: (id: string) => Promise<boolean>;
  unarchiveAsset: (id: string) => Promise<boolean>;
  bulkSetStatus: (
    ids: string[],
    status: AssetStatus
  ) => Promise<{ previous: Record<string, AssetStatus> } | null>;
  bulkArchive: (ids: string[]) => Promise<boolean>;
  bulkUnarchive: (ids: string[]) => Promise<boolean>;
  /** Restore mixed previous statuses after bulk change (one reload, no spam toast) */
  restoreStatuses: (
    previous: Record<string, AssetStatus>
  ) => Promise<boolean>;
  clearTrialData: () => boolean;
  resetToSeed: () => boolean;
  findSimilar: (input: {
    name: string;
    brand: string;
    model: string;
  }) => AssetItem[];
  dismissStorageError: () => void;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  importLocalToSupabase: () => Promise<{
    ok: boolean;
    count: number;
    error?: string;
  }>;
};

const AssetContext = createContext<AssetContextValue | null>(null);

export function AssetProvider({ children }: { children: ReactNode }) {
  const configured = getSupabaseEnvStatus().configured;
  const { workspaceId, ready: workspaceReady } = useWorkspace();
  const { displayName, user } = useAuth();
  const actor = displayName ?? user?.email?.split("@")[0] ?? "ผู้ใช้งาน";
  const savingLock = useRef(false);

  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [decisionGroups, setDecisionGroups] = useState<AssetDecisionGroup[]>(
    []
  );
  const [loading, setLoading] = useState(configured);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(!configured);
  const [mode, setMode] = useState<"online" | "offline">("offline");
  const [error, setError] = useState<string | null>(
    configured ? null : getSupabaseEnvStatus().error
  );
  const [warning, setWarning] = useState<string | null>(null);
  const [browserOffline, setBrowserOffline] = useState(false);

  const loadOnline = useCallback(async () => {
    const env = getSupabaseEnvStatus();
    setBrowserOffline(!getBrowserOnline());

    if (!env.configured) {
      setError(env.error);
      setMode("offline");
      setAssets([]);
      setDecisionGroups([]);
      setLoading(false);
      setReady(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [rows, groups] = await Promise.all([
        assetService.list(workspaceId),
        assetService.listDecisionGroups(workspaceId),
      ]);
      setAssets(rows.map(assetToUiItem));
      setDecisionGroups(groups.map(decisionGroupToUi));
      setMode("online");
    } catch (e) {
      biRuntimeError("AssetProvider", "list + decisionGroups", e, {
        table: "bi_assets",
      });
      setError(userFacingMessage(e));
      setMode("offline");
      // No localStorage / seed fallback — Supabase is SSoT
      setAssets([]);
      setDecisionGroups([]);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [workspaceId]);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate via AssetService */
  useEffect(() => {
    if (!workspaceReady && configured) return;
    void loadOnline();
  }, [workspaceReady, configured, loadOnline]);

  useEffect(() => {
    const onOnline = () => {
      setBrowserOffline(false);
      void loadOnline();
    };
    const onOffline = () => setBrowserOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [loadOnline]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const withSave = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    if (mode !== "online") {
      setError("ต้องเชื่อมต่อออนไลน์ถึงจะบันทึกได้");
      return null;
    }
    if (savingLock.current) return null;
    savingLock.current = true;
    setSaving(true);
    setError(null);
    setWarning(null);
    try {
      return await fn();
    } catch (e) {
      setError(userFacingMessage(e));
      return null;
    } finally {
      savingLock.current = false;
      setSaving(false);
    }
  }, [mode]);

  const getById = useCallback(
    (id: string) => assets.find((a) => a.id === id) ?? null,
    [assets]
  );

  const addAsset = useCallback(
    async (item: Omit<AssetItem, "id">) => {
      return withSave(async () => {
        const { asset, warning: w } = await assetService.createAsset(
          workspaceId,
          item,
          actor
        );
        if (w) setWarning(w);
        await loadOnline();
        showInfoToast("✓ บันทึกแล้ว");
        return assetToUiItem(asset);
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const updateAsset = useCallback(
    async (id: string, patch: Partial<AssetItem>) => {
      return withSave(async () => {
        const { asset, warning: w } = await assetService.updateAsset(
          workspaceId,
          id,
          patch,
          actor
        );
        if (w) setWarning(w);
        await loadOnline();
        showInfoToast("✓ บันทึกแล้ว");
        return assetToUiItem(asset);
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const duplicateAsset = useCallback(
    async (id: string, overrides: Partial<AssetItem> = {}) => {
      return withSave(async () => {
        const asset = await assetService.duplicateAsset(
          workspaceId,
          id,
          overrides,
          actor
        );
        await loadOnline();
        showInfoToast("✓ ทำสำเนาแล้ว");
        return assetToUiItem(asset);
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const addPurchaseRound = useCallback(
    async (
      id: string,
      round: Omit<AssetPurchaseRecord, "id" | "assetId">
    ) => {
      return withSave(async () => {
        const asset = await assetService.purchaseMore(
          workspaceId,
          id,
          round,
          actor
        );
        await loadOnline();
        showInfoToast("✓ บันทึกแล้ว");
        return assetToUiItem(asset);
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const addRepairRecord = useCallback(
    async (
      id: string,
      repair: Omit<AssetRepairRecord, "id" | "assetId">
    ) => {
      return withSave(async () => {
        const asset = await assetService.addRepair(
          workspaceId,
          id,
          repair,
          actor
        );
        await loadOnline();
        showInfoToast("✓ บันทึกแล้ว");
        return assetToUiItem(asset);
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const setStatus = useCallback(
    async (id: string, status: AssetStatus, opts?: MuteOpts) => {
      await withSave(async () => {
        const { warning: w } = await assetService.updateAsset(
          workspaceId,
          id,
          { status },
          actor
        );
        if (w) setWarning(w);
        await loadOnline();
        if (!opts?.silent) showInfoToast("✓ เปลี่ยนสถานะแล้ว");
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const archiveAsset = useCallback(
    async (id: string, opts?: MuteOpts) => {
      const result = await withSave(async () => {
        await assetService.archiveAsset(workspaceId, id, actor);
        await loadOnline();
        if (!opts?.silent) showInfoToast("✓ เก็บรายการแล้ว");
        return true;
      });
      return Boolean(result);
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const unarchiveAsset = useCallback(
    async (id: string, opts?: MuteOpts) => {
      const result = await withSave(async () => {
        await assetService.unarchiveAsset(workspaceId, id, actor);
        await loadOnline();
        if (!opts?.silent) showInfoToast("✓ กู้คืนแล้ว");
        return true;
      });
      return Boolean(result);
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const bulkSetStatus = useCallback(
    async (ids: string[], status: AssetStatus) => {
      if (ids.length === 0) return null;
      return withSave(async () => {
        const previous: Record<string, AssetStatus> = {};
        for (const id of ids) {
          const row = assets.find((a) => a.id === id);
          if (row) previous[id] = row.status;
          const { warning: w } = await assetService.updateAsset(
            workspaceId,
            id,
            { status },
            actor
          );
          if (w) setWarning(w);
        }
        await loadOnline();
        return { previous };
      });
    },
    [withSave, workspaceId, actor, loadOnline, assets]
  );

  const bulkArchive = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return false;
      const result = await withSave(async () => {
        for (const id of ids) {
          await assetService.archiveAsset(workspaceId, id, actor);
        }
        await loadOnline();
        return true;
      });
      return Boolean(result);
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const bulkUnarchive = useCallback(
    async (ids: string[]) => {
      if (ids.length === 0) return false;
      const result = await withSave(async () => {
        for (const id of ids) {
          await assetService.unarchiveAsset(workspaceId, id, actor);
        }
        await loadOnline();
        return true;
      });
      return Boolean(result);
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const restoreStatuses = useCallback(
    async (previous: Record<string, AssetStatus>) => {
      const entries = Object.entries(previous);
      if (entries.length === 0) return false;
      const result = await withSave(async () => {
        for (const [id, status] of entries) {
          await assetService.updateAsset(workspaceId, id, { status }, actor);
        }
        await loadOnline();
        return true;
      });
      return Boolean(result);
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const value = useMemo<AssetContextValue>(
    () => ({
      assets,
      decisionGroups,
      ready,
      loading,
      saving,
      mode,
      online: mode === "online",
      configured,
      browserOffline,
      storageError: null,
      storageKey: "(supabase)",
      schemaVersion: 2,
      error,
      warning,
      canImportLocal: false,
      getById,
      addAsset,
      updateAsset,
      duplicateAsset,
      addPurchaseRound,
      addRepairRecord,
      setStatus,
      archiveAsset,
      unarchiveAsset,
      bulkSetStatus,
      bulkArchive,
      bulkUnarchive,
      restoreStatuses,
      clearTrialData: () => {
        setError("โหมดออนไลน์ — ใช้ Archive แทนการล้างทั้งหมด");
        return false;
      },
      resetToSeed: () => {
        void loadOnline();
        return true;
      },
      findSimilar: (input) => findSimilarAssets(assets, input),
      dismissStorageError: () => undefined,
      retry: loadOnline,
      refresh: loadOnline,
      importLocalToSupabase: async () => ({
        ok: false,
        count: 0,
        error: "เลิกใช้ localStorage สำหรับข้อมูลธุรกิจแล้ว",
      }),
    }),
    [
      assets,
      decisionGroups,
      ready,
      loading,
      saving,
      mode,
      configured,
      browserOffline,
      error,
      warning,
      getById,
      addAsset,
      updateAsset,
      duplicateAsset,
      addPurchaseRound,
      addRepairRecord,
      setStatus,
      archiveAsset,
      unarchiveAsset,
      bulkSetStatus,
      bulkArchive,
      bulkUnarchive,
      restoreStatuses,
      loadOnline,
    ]
  );

  return (
    <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
  );
}

export function useAssets() {
  const ctx = useContext(AssetContext);
  if (!ctx) throw new Error("useAssets must be used within AssetProvider");
  return ctx;
}

export function useAsset() {
  return useAssets();
}

export function isAssetOwned(status: AssetStatus) {
  return seedIsAssetOwned(status);
}

export function getAssetsSummary(assets: AssetItem[]) {
  // Money + counts from shared Opening rollup (Zero Duplicate · same as Hub)
  const opening = buildOpeningSummary(assets);
  return {
    total: opening.totalCount,
    owned: opening.buckets.countOwned,
    needBuy: opening.buckets.countNeed,
    noPrice: opening.noPriceCount,
    totalValue: opening.inventoryTotal,
  };
}

export const AssetsProvider = AssetProvider;
