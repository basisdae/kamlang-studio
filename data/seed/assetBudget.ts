/**
 * Asset ↔ Budget linking helpers (seed / local only).
 * Ready for future Supabase: same shapes, swap data source.
 */

import {
  SEED_ASSET_DECISION_GROUPS,
  SEED_ASSETS,
  isAssetActualSpend,
  isAssetPlannedSpend,
  type AssetDecisionGroup,
  type AssetItem,
} from "./assets";

export type StockCostItem = {
  estimatedCost: number | null;
};

export function assetUnitPrice(asset: AssetItem): number | null {
  return asset.actualPrice ?? asset.estimatedPrice;
}

export function assetLineTotal(asset: AssetItem): number | null {
  const unit = assetUnitPrice(asset);
  if (unit == null) return null;
  return unit * asset.quantity;
}

/** Assets that count toward budget (respect decision groups — pick one) */
export function assetsForBudget(
  assets: AssetItem[] = SEED_ASSETS,
  groups: AssetDecisionGroup[] = SEED_ASSET_DECISION_GROUPS
): AssetItem[] {
  const excluded = new Set<string>();

  for (const group of groups) {
    if (group.selectedId) {
      for (const id of group.assetIds) {
        if (id !== group.selectedId) excluded.add(id);
      }
    } else {
      for (const id of group.assetIds) excluded.add(id);
    }
  }

  return assets.filter((a) => {
    if (!a.decisionGroupId) return true;
    return !excluded.has(a.id);
  });
}

export type DecisionGroupBudgetView = {
  group: AssetDecisionGroup;
  options: AssetItem[];
  selected: AssetItem | null;
  undecided: boolean;
  minAmount: number;
  maxAmount: number;
  savingsIfCheapest: number;
  cheapest: AssetItem | null;
  expensive: AssetItem | null;
};

export function getDecisionGroupBudgetViews(
  assets: AssetItem[] = SEED_ASSETS,
  groups: AssetDecisionGroup[] = SEED_ASSET_DECISION_GROUPS
): DecisionGroupBudgetView[] {
  return groups.map((group) => {
    const options = group.assetIds
      .map((id) => assets.find((a) => a.id === id))
      .filter((a): a is AssetItem => Boolean(a));
    const amounts = options
      .map((o) => assetLineTotal(o))
      .filter((n): n is number => n != null);
    const minAmount = amounts.length ? Math.min(...amounts) : 0;
    const maxAmount = amounts.length ? Math.max(...amounts) : 0;
    const cheapest =
      options.find((o) => assetLineTotal(o) === minAmount) ?? null;
    const expensive =
      options.find((o) => assetLineTotal(o) === maxAmount) ?? null;
    const selected = group.selectedId
      ? (options.find((o) => o.id === group.selectedId) ?? null)
      : null;

    return {
      group,
      options,
      selected,
      undecided: group.selectedId == null,
      minAmount,
      maxAmount,
      savingsIfCheapest: maxAmount - minAmount,
      cheapest,
      expensive,
    };
  });
}

export type AssetsBudgetSummary = {
  equipmentPlanned: number;
  equipmentActual: number;
  stockTotal: number;
  decided: number;
  uncertain: number;
  rangeMin: number;
  rangeMax: number;
  decisionHints: string[];
};

export function getAssetsBudgetSummary(
  assets: AssetItem[] = SEED_ASSETS,
  stock: StockCostItem[] = [],
  groups: AssetDecisionGroup[] = SEED_ASSET_DECISION_GROUPS
): AssetsBudgetSummary {
  const countable = assetsForBudget(assets, groups);
  const groupViews = getDecisionGroupBudgetViews(assets, groups);

  let equipmentPlanned = 0;
  let equipmentActual = 0;
  let decided = 0;
  let uncertain = 0;

  for (const asset of countable) {
    const total = assetLineTotal(asset);
    if (total == null) {
      uncertain += 1;
      continue;
    }
    if (isAssetPlannedSpend(asset.status)) {
      equipmentPlanned += total;
      decided += total;
    } else if (isAssetActualSpend(asset.status)) {
      equipmentActual += total;
      decided += total;
    }
  }

  let groupMin = 0;
  let groupMax = 0;
  const decisionHints: string[] = [];

  for (const view of groupViews) {
    if (view.undecided) {
      groupMin += view.minAmount;
      groupMax += view.maxAmount;
      uncertain += 1;
      if (view.cheapest && view.savingsIfCheapest > 0) {
        decisionHints.push(
          `หากเลือก ${view.cheapest.name} งบรวมจะลดลง ${view.savingsIfCheapest.toLocaleString("th-TH")} บาท`
        );
      }
    } else if (view.selected) {
      const t = assetLineTotal(view.selected) ?? 0;
      if (isAssetActualSpend(view.selected.status)) {
        equipmentActual += t;
      } else {
        equipmentPlanned += t;
      }
      decided += t;
      groupMin += t;
      groupMax += t;
    }
  }

  const stockTotal = stock.reduce((sum, s) => sum + (s.estimatedCost ?? 0), 0);

  const base = equipmentPlanned + equipmentActual + stockTotal;
  const rangeMin = base + groupMin;
  const rangeMax = base + groupMax;

  return {
    equipmentPlanned,
    equipmentActual,
    stockTotal,
    decided,
    uncertain,
    rangeMin,
    rangeMax,
    decisionHints,
  };
}

/** Map budget line id → asset id for navigation */
export const BUDGET_TO_ASSET_ID: Record<string, string> = {
  i1: "as1",
  i2: "as-gas",
  i3: "as2",
  i5: "as-sign",
};

export function budgetItemAssetHref(budgetId: string): string | null {
  if (budgetId === "i4") return "/opening/assets/as-pos-mini";
  const assetId = BUDGET_TO_ASSET_ID[budgetId];
  return assetId ? `/opening/assets/${assetId}` : null;
}
