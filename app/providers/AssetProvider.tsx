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
  type AssetDecisionGroup,
  type AssetItem,
  type AssetPurchaseRecord,
  type AssetRepairRecord,
  type AssetStatus,
} from "../../data/seed/tangtao";
import { getSupabaseEnvStatus } from "../../lib/supabase/env";
import { getBrowserOnline } from "../../lib/supabase/service";
import { biDevError, userFacingMessage } from "../../lib/supabase/errors";
import { assetService } from "../../lib/services/assetService";
import {
  assetToUiItem,
  decisionGroupToUi,
} from "../../lib/mappers/uiAdapters";
import {
  ASSETS_STORAGE_KEY,
  ASSETS_STORAGE_KEY_V1,
  ASSETS_STORAGE_KEY_V2_LEGACY,
  findSimilarAssets,
  loadAssetsCacheOnly,
  normalizeAsset,
  persistAssets,
  type AssetsStorageError,
} from "../opening/assets/lib/assetsStorage";
import { useWorkspace } from "./WorkspaceProvider";
import { useAuth } from "../auth/AuthProvider";
import { showInfoToast } from "../lib/biInfoToast";

const IMPORT_FLAG_KEY = "business-insight.assets.imported-to-supabase.v1";

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
  storageError: AssetsStorageError | null;
  storageKey: string;
  schemaVersion: number;
  error: string | null;
  warning: string | null;
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

function readImportFlag() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(IMPORT_FLAG_KEY) === "1";
}

function setImportFlag() {
  window.localStorage.setItem(IMPORT_FLAG_KEY, "1");
}

function collectLegacyLocalAssets(): AssetItem[] {
  const keys = [
    ASSETS_STORAGE_KEY,
    ASSETS_STORAGE_KEY_V2_LEGACY,
    ASSETS_STORAGE_KEY_V1,
  ];
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : parsed &&
            typeof parsed === "object" &&
            Array.isArray((parsed as { assets?: unknown }).assets)
          ? (parsed as { assets: unknown[] }).assets
          : null;
      if (!list) continue;
      const assets = list
        .map((row) => normalizeAsset(row as Partial<AssetItem>))
        .filter((a): a is AssetItem => Boolean(a));
      if (assets.length) return assets;
    } catch {
      /* next */
    }
  }
  return [];
}

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
  // Never claim online until query succeeds
  const [mode, setMode] = useState<"online" | "offline">("offline");
  const [error, setError] = useState<string | null>(
    configured ? null : getSupabaseEnvStatus().error
  );
  const [warning, setWarning] = useState<string | null>(null);
  const [browserOffline, setBrowserOffline] = useState(false);
  const [storageError, setStorageError] = useState<AssetsStorageError | null>(
    null
  );
  const [importedAlready, setImportedAlready] = useState(() =>
    typeof window === "undefined" ? true : readImportFlag()
  );

  const loadOnline = useCallback(async () => {
    const env = getSupabaseEnvStatus();
    setBrowserOffline(!getBrowserOnline());

    if (!env.configured) {
      setError(env.error);
      setMode("offline");
      setAssets([]);
      setDecisionGroups([]);
      setStorageError(null);
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
      const uiAssets = rows.map(assetToUiItem);
      setAssets(uiAssets);
      setDecisionGroups(groups.map(decisionGroupToUi));
      setMode("online");
      persistAssets(uiAssets);
      setStorageError(null);
    } catch (e) {
      biDevError("AssetProvider", "list + decisionGroups", e);
      setError(userFacingMessage(e));
      setMode("offline");
      // Cache only — never silent seed fallback
      const cache = loadAssetsCacheOnly();
      setAssets(cache.assets);
      setStorageError(cache.error);
      if (!cache.hit) {
        setAssets([]);
      }
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
        showInfoToast("บันทึกอุปกรณ์แล้ว");
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
        showInfoToast("อัปเดตแล้ว");
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
        showInfoToast("ทำสำเนาแล้ว");
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
        showInfoToast("บันทึกการซื้อเพิ่มแล้ว");
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
        showInfoToast("บันทึกประวัติซ่อมแล้ว");
        return assetToUiItem(asset);
      });
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const setStatus = useCallback(
    async (id: string, status: AssetStatus) => {
      await updateAsset(id, { status });
    },
    [updateAsset]
  );

  const archiveAsset = useCallback(
    async (id: string) => {
      const result = await withSave(async () => {
        await assetService.archiveAsset(workspaceId, id, actor);
        await loadOnline();
        showInfoToast("เก็บรายการแล้ว");
        return true;
      });
      return Boolean(result);
    },
    [withSave, workspaceId, actor, loadOnline]
  );

  const importLocalToSupabase = useCallback(async () => {
    if (readImportFlag()) {
      return { ok: false, count: 0, error: "นำเข้าไปแล้ว — ไม่ทำซ้ำอัตโนมัติ" };
    }
    if (mode !== "online") {
      return { ok: false, count: 0, error: "ต้องออนไลน์ก่อนนำเข้า" };
    }
    const local = collectLegacyLocalAssets();
    if (local.length === 0) {
      setImportFlag();
      setImportedAlready(true);
      return { ok: false, count: 0, error: "ไม่พบข้อมูล localStorage" };
    }
    try {
      let count = 0;
      for (const item of local) {
        const { id: _id, purchaseHistory, repairHistory, ...rest } = item;
        void _id;
        const created = await assetService.createAsset(
          workspaceId,
          {
            ...rest,
            purchaseHistory: [],
            repairHistory: [],
            documentIds: [],
            imageUrl: null,
          },
          actor
        );
        for (const p of purchaseHistory) {
          await assetService.purchaseMore(workspaceId, created.asset.id, p, actor);
        }
        for (const r of repairHistory) {
          await assetService.addRepair(workspaceId, created.asset.id, r, actor);
        }
        count += 1;
      }
      setImportFlag();
      setImportedAlready(true);
      await loadOnline();
      showInfoToast(`นำเข้า ${count} รายการแล้ว`);
      return { ok: true, count };
    } catch (e) {
      return { ok: false, count: 0, error: userFacingMessage(e) };
    }
  }, [mode, workspaceId, actor, loadOnline]);

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
      storageError,
      storageKey: ASSETS_STORAGE_KEY,
      schemaVersion: 2,
      error,
      warning,
      canImportLocal:
        configured && mode === "online" && !importedAlready,
      getById,
      addAsset,
      updateAsset,
      duplicateAsset,
      addPurchaseRound,
      addRepairRecord,
      setStatus,
      archiveAsset,
      clearTrialData: () => {
        setError("โหมดออนไลน์ — ใช้ Archive แทนการล้างทั้งหมด");
        return false;
      },
      resetToSeed: () => {
        void loadOnline();
        return true;
      },
      findSimilar: (input) => findSimilarAssets(assets, input),
      dismissStorageError: () => setStorageError(null),
      retry: loadOnline,
      refresh: loadOnline,
      importLocalToSupabase,
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
      storageError,
      error,
      warning,
      importedAlready,
      getById,
      addAsset,
      updateAsset,
      duplicateAsset,
      addPurchaseRound,
      addRepairRecord,
      setStatus,
      archiveAsset,
      loadOnline,
      importLocalToSupabase,
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
  const owned = assets.filter((a) => isAssetOwned(a.status));
  const needBuy = assets.filter((a) => !isAssetOwned(a.status));
  const noPrice = assets.filter(
    (a) => a.estimatedPrice == null && a.actualPrice == null
  );
  const totalValue = assets.reduce((sum, a) => {
    const unit = a.actualPrice ?? a.estimatedPrice;
    return sum + (unit != null ? unit * a.quantity : 0);
  }, 0);
  return {
    total: assets.length,
    owned: owned.length,
    needBuy: needBuy.length,
    noPrice: noPrice.length,
    totalValue,
  };
}

export const AssetsProvider = AssetProvider;
