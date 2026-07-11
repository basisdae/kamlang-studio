import { getBiRepositories } from "../repositories";
import type { Asset, AssetDecisionGroup } from "../types/asset";
import type { BudgetItem, BudgetSummary } from "../types/budget";

function isAcquired(status: BudgetItem["status"]) {
  return (
    status === "purchased" ||
    status === "awaiting_delivery" ||
    status === "received" ||
    status === "installed"
  );
}

function isReady(status: BudgetItem["status"]) {
  return status === "received" || status === "installed";
}

function lineAmount(item: BudgetItem): number | null {
  const unit = item.actualAmount ?? item.plannedAmount;
  if (unit == null) return null;
  return unit * (item.quantity ?? 1);
}

/**
 * POS / decision groups: never sum all options.
 * Undecided → min–max range. Selected → that price only.
 */
export function getDecisionImpact(
  assets: Asset[],
  groups: AssetDecisionGroup[]
) {
  return groups.map((group) => {
    const options = assets.filter((a) => a.decisionGroupId === group.id);
    const prices = options
      .map((o) => o.actualUnitPrice ?? o.estimatedUnitPrice)
      .filter((p): p is number => p != null);
    const selected =
      options.find((o) => o.id === (group.selectedAssetId ?? group.selectedId)) ??
      null;
    const selectedPrice =
      selected == null
        ? null
        : (selected.actualUnitPrice ?? selected.estimatedUnitPrice);
    const optionMin = prices.length ? Math.min(...prices) : 0;
    const optionMax = prices.length ? Math.max(...prices) : 0;
    const undecided = !selected;
    const min = undecided ? optionMin : (selectedPrice ?? optionMin);
    const max = undecided ? optionMax : (selectedPrice ?? optionMax);
    const cheapest = options.reduce<Asset | null>((best, cur) => {
      const p = cur.actualUnitPrice ?? cur.estimatedUnitPrice;
      if (p == null) return best;
      if (!best) return cur;
      const bp = best.actualUnitPrice ?? best.estimatedUnitPrice ?? Infinity;
      return p < bp ? cur : best;
    }, null);
    const expensive = options.reduce<Asset | null>((best, cur) => {
      const p = cur.actualUnitPrice ?? cur.estimatedUnitPrice;
      if (p == null) return best;
      if (!best) return cur;
      const bp = best.actualUnitPrice ?? best.estimatedUnitPrice ?? -Infinity;
      return p > bp ? cur : best;
    }, null);
    return {
      group,
      options,
      selected,
      undecided,
      selectedPrice,
      minAmount: min,
      maxAmount: max,
      optionMin,
      optionMax,
      savingsIfCheapest: Math.max(0, optionMax - optionMin),
      cheapest,
      expensive,
    };
  });
}

export class BudgetService {
  async listItems(workspaceId: string): Promise<BudgetItem[]> {
    const { budget } = getBiRepositories();
    return budget.listByWorkspace(workspaceId);
  }

  async listDecisionGroups(
    workspaceId: string
  ): Promise<AssetDecisionGroup[]> {
    const { budget } = getBiRepositories();
    return budget.listDecisionGroups(workspaceId);
  }

  calculateSummary(
    items: BudgetItem[],
    assets: Asset[] = [],
    groups: AssetDecisionGroup[] = []
  ): BudgetSummary {
    const byPriority = (priority: BudgetItem["priority"]) => {
      const group = items.filter((i) => i.priority === priority);
      return {
        total: group.length,
        ready: group.filter((i) => isReady(i.status)).length,
      };
    };
    const must = byPriority("must");
    const should = byPriority("should");
    const nice = byPriority("nice");

    const moneyNeeded = (mustOnly: boolean) =>
      items
        .filter((i) => {
          if (isAcquired(i.status)) return false;
          if (mustOnly) return i.priority === "must";
          return true;
        })
        .reduce((sum, i) => sum + (i.plannedAmount ?? 0) * (i.quantity ?? 1), 0);

    const unknown = (mustOnly: boolean) =>
      items.filter((i) => {
        if (isAcquired(i.status)) return false;
        if (mustOnly && i.priority !== "must") return false;
        return i.plannedAmount == null;
      }).length;

    const impacts = getDecisionImpact(assets, groups);
    const decisionHints: string[] = [];
    for (const i of impacts) {
      if (i.undecided) {
        decisionHints.push(
          `“${i.group.name}” ยังไม่เลือก — งบประมาณนับช่วง ${i.optionMin.toLocaleString("th-TH")}–${i.optionMax.toLocaleString("th-TH")} บาท (ห้ามบวกทุกรุ่น)`
        );
        if (i.cheapest && i.savingsIfCheapest > 0) {
          const short =
            i.cheapest.model ||
            i.cheapest.name.replace(/^SUNMI\s+/i, "").trim() ||
            i.cheapest.name;
          decisionHints.push(
            `เลือก ${short} ลดงบ ${i.savingsIfCheapest.toLocaleString("th-TH")} บาท`
          );
        }
      } else if (i.selected && i.selectedPrice != null) {
        decisionHints.push(
          `เลือกแล้ว: ${i.selected.name} · ${i.selectedPrice.toLocaleString("th-TH")} บาท`
        );
      }
    }

    return {
      readyPercent:
        must.total === 0
          ? 0
          : Math.round((must.ready / must.total) * 100),
      mustReady: must.ready,
      mustTotal: must.total,
      shouldReady: should.ready,
      shouldTotal: should.total,
      niceReady: nice.ready,
      niceTotal: nice.total,
      moneyNeededAll: moneyNeeded(false),
      moneyNeededMust: moneyNeeded(true),
      unknownPriceAll: unknown(false),
      unknownPriceMust: unknown(true),
      minimumBudget: this.calculateMinimumBudget(items, assets, groups),
      maximumBudget: this.calculateMaximumBudget(items, assets, groups),
      uncertainBudget: this.calculateUncertainBudget(items, assets, groups),
      decisionHints,
    };
  }

  calculateMustHaveBudget(items: BudgetItem[]): number {
    return items
      .filter((i) => i.priority === "must" && !isAcquired(i.status))
      .reduce((sum, i) => sum + (lineAmount(i) ?? 0), 0);
  }

  calculateMinimumBudget(
    items: BudgetItem[],
    assets: Asset[],
    groups: AssetDecisionGroup[]
  ): number {
    return this.sumBudgetWithDecisionGroups(items, assets, groups, "min");
  }

  calculateMaximumBudget(
    items: BudgetItem[],
    assets: Asset[],
    groups: AssetDecisionGroup[]
  ): number {
    return this.sumBudgetWithDecisionGroups(items, assets, groups, "max");
  }

  /** Each decision group counted once — never sum both POS options. */
  private sumBudgetWithDecisionGroups(
    items: BudgetItem[],
    assets: Asset[],
    groups: AssetDecisionGroup[],
    bound: "min" | "max"
  ): number {
    const impacts = getDecisionImpact(assets, groups);
    const groupIds = new Set(groups.map((g) => g.id));
    const countedGroups = new Set<string>();
    let total = 0;
    for (const item of items) {
      const gid = item.decisionGroupId;
      if (gid && groupIds.has(gid)) {
        if (countedGroups.has(gid)) continue;
        countedGroups.add(gid);
        const impact = impacts.find((i) => i.group.id === gid);
        total +=
          bound === "min"
            ? (impact?.minAmount ?? 0)
            : (impact?.maxAmount ?? 0);
        continue;
      }
      total += (item.actualAmount ?? item.plannedAmount ?? 0) * (item.quantity ?? 1);
    }
    return total;
  }

  calculateUncertainBudget(
    items: BudgetItem[],
    assets: Asset[],
    groups: AssetDecisionGroup[]
  ): number {
    const max = this.calculateMaximumBudget(items, assets, groups);
    const min = this.calculateMinimumBudget(items, assets, groups);
    return Math.max(0, max - min);
  }

  getDecisionImpact(assets: Asset[], groups: AssetDecisionGroup[]) {
    return getDecisionImpact(assets, groups);
  }
}

export const budgetService = new BudgetService();
