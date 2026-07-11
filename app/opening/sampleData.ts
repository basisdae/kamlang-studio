/**
 * Opening helpers + re-exports from Tang Tao seed.
 * Source of truth: data/seed/tangtao.ts
 */

export {
  APP_TAGLINE,
  ASSET_STATUS_LABELS,
  BUSINESS_READINESS,
  OPENING_ASSETS,
  OPENING_BUDGET_ITEMS,
  OPENING_CATEGORIES,
  OPENING_CHECKLIST,
  OPENING_NEXT_ACTIONS,
  OPENING_SUMMARY,
  OPENING_TEAM,
  OPENING_INITIAL_STOCK,
  READINESS_STATUS_LABELS,
  SEED_ASSET_TIMELINES,
  SEED_BUDGET_TARGET,
  OPENING_DOCUMENTS,
  WORKSPACE_NAME,
  type AssetItem,
  type AssetPriority,
  type AssetStatus,
  type AssetTimelineStep,
  type BudgetItem,
  type BudgetPriority,
  type BudgetStatus,
  type ChecklistItem,
  type DocumentKind,
  type InitialStockItem,
  type OpeningCategory,
  type OpeningDocument,
  type ReadinessArea,
  type ReadinessStatus,
  type TeamMember,
} from "../../data/seed/tangtao";

import type {
  AssetItem,
  BudgetItem,
  BudgetPriority,
  BudgetStatus,
  ChecklistItem,
  InitialStockItem,
  OpeningDocument,
} from "../../data/seed/tangtao";
import {
  BUSINESS_READINESS,
  OPENING_ASSETS,
  OPENING_BUDGET_ITEMS,
  OPENING_CHECKLIST,
  OPENING_DOCUMENTS,
  OPENING_INITIAL_STOCK,
  SEED_ASSET_DECISION_GROUPS,
  SEED_ASSET_TIMELINES,
} from "../../data/seed/tangtao";
import type { ReadinessArea } from "../../data/seed/tangtao";
import {
  budgetItemAssetHref,
  getAssetsBudgetSummary as summarizeAssetsBudget,
  getDecisionGroupBudgetViews,
} from "../../data/seed/assetBudget";

export {
  budgetItemAssetHref,
  getDecisionGroupBudgetViews,
};

export function getAssetsBudgetSummary() {
  return summarizeAssetsBudget(
    OPENING_ASSETS,
    OPENING_INITIAL_STOCK,
    SEED_ASSET_DECISION_GROUPS
  );
}

export const PRIORITY_LABELS: Record<BudgetPriority, string> = {
  must: "Must Have",
  should: "Should Have",
  nice: "Nice to Have",
};

export const STATUS_LABELS: Record<BudgetStatus, string> = {
  no_price: "ยังไม่หาราคา",
  comparing: "กำลังเปรียบเทียบ",
  ready_to_buy: "พร้อมซื้อ",
  purchased: "ซื้อแล้ว",
  awaiting_delivery: "รอจัดส่ง",
  received: "ได้รับแล้ว",
  installed: "ติดตั้งแล้ว",
};

export const STATUS_WORKFLOW_ORDER: BudgetStatus[] = [
  "no_price",
  "comparing",
  "ready_to_buy",
  "purchased",
  "awaiting_delivery",
  "received",
  "installed",
];

const PRIORITY_ORDER: Record<BudgetPriority, number> = {
  must: 0,
  should: 1,
  nice: 2,
};

export function formatBaht(value: number) {
  return `${value.toLocaleString("th-TH")} บาท`;
}

export function getBudgetLineTotal(item: BudgetItem) {
  const unit = item.actualPrice ?? item.estimatedPrice;
  if (unit == null) return null;
  return unit * item.quantity;
}

export function isBudgetAcquired(status: BudgetStatus) {
  return (
    status === "purchased" ||
    status === "awaiting_delivery" ||
    status === "received" ||
    status === "installed"
  );
}

export function isBudgetReady(status: BudgetStatus) {
  return status === "received" || status === "installed";
}

export function getPriorityBreakdown(
  items: BudgetItem[] = OPENING_BUDGET_ITEMS
) {
  const byPriority = (priority: BudgetPriority) => {
    const group = items.filter((item) => item.priority === priority);
    const ready = group.filter((item) => isBudgetReady(item.status)).length;
    return { total: group.length, ready };
  };

  return {
    must: byPriority("must"),
    should: byPriority("should"),
    nice: byPriority("nice"),
  };
}

export function getBudgetReadyPercent(
  items: BudgetItem[] = OPENING_BUDGET_ITEMS
) {
  const must = items.filter((item) => item.priority === "must");
  if (must.length === 0) return 0;
  const ready = must.filter((item) => isBudgetReady(item.status)).length;
  return Math.round((ready / must.length) * 100);
}

export function getBudgetMoneyNeeded(
  items: BudgetItem[],
  options?: { mustOnly?: boolean }
) {
  return items
    .filter((item) => {
      if (isBudgetAcquired(item.status)) return false;
      if (options?.mustOnly) return item.priority === "must";
      return true;
    })
    .reduce((sum, item) => {
      const unit = item.estimatedPrice;
      if (unit == null) return sum;
      return sum + unit * item.quantity;
    }, 0);
}

export function getBudgetUnknownPriceCount(
  items: BudgetItem[] = OPENING_BUDGET_ITEMS,
  options?: { mustOnly?: boolean }
) {
  return items.filter((item) => {
    if (isBudgetAcquired(item.status)) return false;
    if (options?.mustOnly && item.priority !== "must") return false;
    return item.estimatedPrice == null;
  }).length;
}

export function getBudgetDecisions(items: BudgetItem[] = OPENING_BUDGET_ITEMS) {
  return items.filter(
    (item) => item.status === "no_price" || item.status === "comparing"
  );
}

export function sortBudgetItemsByDecision(items: BudgetItem[]) {
  return [...items].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    return (
      STATUS_WORKFLOW_ORDER.indexOf(a.status) -
      STATUS_WORKFLOW_ORDER.indexOf(b.status)
    );
  });
}

export function getBudgetTodayDecision(
  items: BudgetItem[] = OPENING_BUDGET_ITEMS
) {
  const sorted = sortBudgetItemsByDecision(getBudgetDecisions(items));
  return (
    sorted[0] ??
    sortBudgetItemsByDecision(
      items.filter((item) => item.status === "ready_to_buy")
    )[0] ??
    null
  );
}

export function getBudgetSpent(items: BudgetItem[] = OPENING_BUDGET_ITEMS) {
  return items
    .filter((item) => isBudgetAcquired(item.status))
    .reduce((sum, item) => {
      const unit = item.actualPrice ?? item.estimatedPrice ?? 0;
      return sum + unit * item.quantity;
    }, 0);
}

export function getBudgetNotBought(items: BudgetItem[] = OPENING_BUDGET_ITEMS) {
  return items.filter((item) => !isBudgetAcquired(item.status));
}

export function getChecklistProgress(
  items: ChecklistItem[] = OPENING_CHECKLIST
) {
  const done = items.filter((item) => item.done).length;
  return { done, total: items.length, remaining: items.length - done };
}

export function getPrimaryOpeningNextStep(): {
  message: string;
  href: string;
  actionLabel: string;
} {
  const pendingChecklist = OPENING_CHECKLIST.find((item) => !item.done);
  if (pendingChecklist) {
    return {
      message: `ยังไม่พร้อมเปิด — เหลือ “${pendingChecklist.label}” ในรายการตรวจสอบ`,
      href: "/opening/checklist",
      actionLabel: "ไปรายการตรวจสอบ",
    };
  }

  const needsPrice = OPENING_BUDGET_ITEMS.find(
    (item) => item.status === "no_price" || item.status === "comparing"
  );
  if (needsPrice) {
    return {
      message: `ควรเคลียร์ราคา “${needsPrice.name}” ในงบประมาณ`,
      href: "/opening/budget",
      actionLabel: "ดูงบประมาณ",
    };
  }

  return {
    message: "สรุปสัดส่วนกับทีมบริหารก่อนเปิดร้าน",
    href: "/opening/team",
    actionLabel: "ไปทีมบริหาร",
  };
}

export function getAssetsWithoutPrice(assets: AssetItem[] = OPENING_ASSETS) {
  return assets.filter((item) => item.estimatedPrice == null);
}

export function getInitialStockTotal(
  items: InitialStockItem[] = OPENING_INITIAL_STOCK
) {
  return items.reduce((sum, item) => sum + (item.estimatedCost ?? 0), 0);
}

export function getAssetById(id: string) {
  return OPENING_ASSETS.find((item) => item.id === id) ?? null;
}

export function getAssetTimeline(assetId: string) {
  return SEED_ASSET_TIMELINES[assetId] ?? [];
}

export function getAssetDocuments(assetId: string): OpeningDocument[] {
  return OPENING_DOCUMENTS.filter(
    (doc) => doc.parentType === "asset" && doc.parentId === assetId
  );
}

export function formatAssetDay(isoDate: string) {
  if (!isoDate) return "—";
  const [y, m, d] = isoDate.split("-").map(Number);
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${d} ${months[m - 1]} ${y + 543}`;
}

export function getBusinessReadinessSummary(
  areas: ReadinessArea[] = BUSINESS_READINESS
) {
  const overall = Math.round(
    areas.reduce((sum, a) => sum + a.percent, 0) / Math.max(areas.length, 1)
  );
  return {
    overall,
    ready: areas.filter((a) => a.status === "ready").length,
    working: areas.filter((a) => a.status === "working").length,
    blocked: areas.filter((a) => a.status === "blocked").length,
    focus:
      areas.find((a) => a.status === "blocked") ??
      areas
        .filter((a) => a.status === "working")
        .sort((a, b) => a.percent - b.percent)[0] ??
      null,
  };
}
