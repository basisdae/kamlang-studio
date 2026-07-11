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
import type { BudgetItem } from "../../data/seed/tangtao";
import type { AssetDecisionGroup } from "../../data/seed/tangtao";
import { getSupabaseEnvStatus } from "../../lib/supabase/env";
import { getBrowserOnline } from "../../lib/supabase/service";
import { biDevError, userFacingMessage } from "../../lib/supabase/errors";
import { budgetService } from "../../lib/services/budgetService";
import type { BudgetSummary } from "../../lib/types/budget";
import {
  budgetToUi,
  decisionGroupToUi,
} from "../../lib/mappers/uiAdapters";
import { useWorkspace } from "./WorkspaceProvider";
import { useAssets } from "./AssetProvider";

const CACHE_KEY = "business-insight.budget.cache.v1";

type BudgetContextValue = {
  items: BudgetItem[];
  decisionGroups: AssetDecisionGroup[];
  summary: BudgetSummary | null;
  ready: boolean;
  loading: boolean;
  online: boolean;
  configured: boolean;
  browserOffline: boolean;
  error: string | null;
  getById: (id: string) => BudgetItem | null;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
};

const BudgetContext = createContext<BudgetContextValue | null>(null);

function readCache(): BudgetItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const parsed = raw ? (JSON.parse(raw) as BudgetItem[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCache(items: BudgetItem[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function BudgetProvider({ children }: { children: ReactNode }) {
  const configured = getSupabaseEnvStatus().configured;
  const { workspaceId, ready: workspaceReady } = useWorkspace();
  const { assets, ready: assetsReady } = useAssets();

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [decisionGroups, setDecisionGroups] = useState<AssetDecisionGroup[]>(
    []
  );
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
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
      setItems([]);
      setDecisionGroups([]);
      setLoading(false);
      setReady(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [rows, groups] = await Promise.all([
        budgetService.listItems(workspaceId),
        budgetService.listDecisionGroups(workspaceId),
      ]);
      const uiItems = rows.map(budgetToUi);
      const uiGroups = groups.map(decisionGroupToUi);
      setItems(uiItems);
      setDecisionGroups(uiGroups);
      writeCache(uiItems);
      setOnline(true);
    } catch (e) {
      biDevError("BudgetProvider", "listItems + decisionGroups", e);
      setError(userFacingMessage(e));
      setOnline(false);
      // Cache only — never silent seed
      const cached = readCache();
      setItems(cached);
      if (cached.length === 0) {
        setItems([]);
      }
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [workspaceId]);

  /* eslint-disable react-hooks/set-state-in-effect -- hydrate via BudgetService */
  useEffect(() => {
    if (!workspaceReady && configured) return;
    void load();
  }, [workspaceReady, configured, load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Recalculate summary when assets or budget items change
  /* eslint-disable react-hooks/set-state-in-effect -- derive budget summary from loaded domain data */
  useEffect(() => {
    if (!assetsReady && configured) return;
    const domainAssets = assets.map((a) => ({
      id: a.id,
      workspaceId,
      name: a.name,
      category: a.category,
      brand: a.brand,
      model: a.model,
      quantity: a.quantity,
      unit: a.unit,
      estimatedUnitPrice: a.estimatedPrice,
      actualUnitPrice: a.actualPrice,
      supplierName: a.supplier,
      purchaseChannel: a.purchaseChannel,
      purchaseUrl: a.purchaseUrl,
      priority: a.priority,
      status: a.status,
      purchaseDate: a.purchasedAt,
      specifications: {
        size: a.size,
        color: a.color,
        material: a.material,
        power: a.power,
        specs: a.specs,
        requiredForOpening: a.requiredForOpening,
      },
      notes: a.note,
      warrantyMonths: null,
      warrantyExpiresAt: a.warrantyUntil,
      serialNumber: a.serialNumber,
      decisionGroupId: a.decisionGroupId,
      isArchived: false,
      createdAt: "",
      updatedAt: "",
      purchaseHistory: [],
      repairHistory: [],
    }));
    const domainGroups = decisionGroups.map((g) => ({
      id: g.id,
      workspaceId,
      name: g.name,
      selectionMode: "single" as const,
      selectedAssetId: g.selectedId,
      notes: "",
      assetIds: g.assetIds,
      selectedId: g.selectedId,
    }));
    const domainItems = items.map((i) => ({
      id: i.id,
      workspaceId,
      name: i.name,
      category: i.category,
      priority: i.priority,
      status: i.status,
      plannedAmount: i.estimatedPrice,
      actualAmount: i.actualPrice,
      assetId: i.assetId ?? null,
      decisionGroupId: i.decisionGroupId ?? null,
      notes: "",
      createdAt: "",
      updatedAt: "",
      quantity: i.quantity,
    }));
    setSummary(
      budgetService.calculateSummary(domainItems, domainAssets, domainGroups)
    );
  }, [assets, assetsReady, configured, decisionGroups, items, workspaceId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const value = useMemo<BudgetContextValue>(
    () => ({
      items,
      decisionGroups,
      summary,
      ready,
      loading,
      online,
      configured,
      browserOffline,
      error,
      getById: (id) => items.find((i) => i.id === id) ?? null,
      retry: load,
      refresh: load,
    }),
    [
      items,
      decisionGroups,
      summary,
      ready,
      loading,
      online,
      configured,
      browserOffline,
      error,
      load,
    ]
  );

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
