/**
 * Smart Budget — outcome of Checklist bi_assets only.
 * Never uses investment / partner capital as calculation base.
 */

import type { AssetItem, AssetStatus } from "../../../data/seed/tangtao";
import {
  assetHasNoPrice,
  isAssetPlannedSpend,
} from "../../../data/seed/tangtao";
import { buildInventoryBuckets } from "../../../lib/services/inventoryRollup";

function isSpentStatus(status: AssetStatus) {
  return (
    status === "ordered" ||
    status === "awaiting_delivery" ||
    status === "received" ||
    status === "in_use"
  );
}

export type SmartBudgetBucketId =
  | "equipment"
  | "ingredients"
  | "packaging"
  | "team"
  | "marketing";

export const SMART_BUDGET_BUCKET_ORDER: SmartBudgetBucketId[] = [
  "equipment",
  "ingredients",
  "packaging",
  "team",
  "marketing",
];

export const SMART_BUDGET_BUCKET_LABELS: Record<SmartBudgetBucketId, string> = {
  equipment: "อุปกรณ์",
  ingredients: "วัตถุดิบ",
  packaging: "Packaging",
  team: "ทีม",
  marketing: "Marketing",
};

const INGREDIENT_CATEGORIES = new Set([
  "ซอสและเครื่องปรุง",
  "เนื้อสัตว์และของแปรรูป",
  "วัตถุดิบเพิ่มเติม",
]);

const PACKAGING_CATEGORIES = new Set(["บรรจุภัณฑ์", "กล่องและบรรจุ"]);

const MARKETING_CATEGORIES = new Set(["หน้าร้านและป้าย"]);

function textBlob(asset: AssetItem) {
  return `${asset.category} ${asset.name} ${asset.note}`.toLowerCase();
}

/** Classify checklist row into Smart Budget bucket (Checklist → Budget). */
export function smartBudgetBucketOf(asset: AssetItem): SmartBudgetBucketId {
  if (INGREDIENT_CATEGORIES.has(asset.category)) return "ingredients";
  if (PACKAGING_CATEGORIES.has(asset.category)) return "packaging";
  if (MARKETING_CATEGORIES.has(asset.category)) return "marketing";

  const blob = textBlob(asset);
  if (
    /marketing|โฆษณา|โปรโมท|โปรโมช|ป้าย|fb|facebook|line\s*oa|tiktok/.test(
      blob
    )
  ) {
    return "marketing";
  }
  if (/ทีม|พนักงาน|เงินเดือน|ค่าแรง|แรงงาน|พาร์ทไทม์|part\s*time/.test(blob)) {
    return "team";
  }
  return "equipment";
}

function estimatedUnit(asset: AssetItem): number | null {
  return asset.estimatedPrice;
}

function actualUnit(asset: AssetItem): number | null {
  return asset.actualPrice;
}

function lineEst(asset: AssetItem): number | null {
  const u = estimatedUnit(asset);
  if (u == null) return null;
  return u * asset.quantity;
}

function lineAct(asset: AssetItem): number | null {
  const u = actualUnit(asset);
  if (u == null) return null;
  return u * asset.quantity;
}

/** Prefer estimated; if missing use actual so plan isn't zero when only actual exists */
function linePlan(asset: AssetItem): number | null {
  return lineEst(asset) ?? lineAct(asset);
}

export type SmartBudgetBucketRow = {
  id: SmartBudgetBucketId;
  label: string;
  count: number;
  estimated: number;
  actual: number;
  need: number;
  noPrice: number;
  difference: number;
  variancePct: number | null;
};

export type SmartBudgetWaterfallStep = {
  id: string;
  label: string;
  amount: number;
  kind: "total" | "spend" | "need" | "diff";
};

export type SmartBudgetReport = {
  /** Sum of planned line values (estimated preferred) — NOT investment */
  estimatedTotal: number;
  /** Sum of actual spend on owned / purchased lines */
  actualTotal: number;
  /** Still need to procure (from shared inventory rollup) */
  needTotal: number;
  /** actualTotal - estimatedTotal */
  difference: number;
  /** (actual - estimated) / estimated * 100; null if estimated is 0 */
  variancePct: number | null;
  unknownPriceCount: number;
  itemCount: number;
  buckets: SmartBudgetBucketRow[];
  waterfall: SmartBudgetWaterfallStep[];
};

function variancePct(actual: number, estimated: number): number | null {
  if (estimated === 0) return null;
  return Math.round(((actual - estimated) / estimated) * 1000) / 10;
}

/**
 * Build Smart Budget from live Checklist assets only.
 * Forbidden: OPENING_SUMMARY.targetBudget, partner investment, seed capital.
 */
export function buildSmartBudget(assets: AssetItem[]): SmartBudgetReport {
  const buckets = buildInventoryBuckets(assets);
  const byBucket = new Map<
    SmartBudgetBucketId,
    {
      count: number;
      estimated: number;
      actual: number;
      need: number;
      noPrice: number;
    }
  >();

  for (const id of SMART_BUDGET_BUCKET_ORDER) {
    byBucket.set(id, {
      count: 0,
      estimated: 0,
      actual: 0,
      need: 0,
      noPrice: 0,
    });
  }

  let estimatedTotal = 0;
  let actualTotal = 0;

  for (const asset of assets) {
    const id = smartBudgetBucketOf(asset);
    const row = byBucket.get(id)!;
    row.count += 1;

    const plan = linePlan(asset);
    if (plan != null) {
      row.estimated += plan;
      estimatedTotal += plan;
    }

    const act = lineAct(asset);
    if (act != null && isSpentStatus(asset.status)) {
      row.actual += act;
      actualTotal += act;
    }

    if (isAssetPlannedSpend(asset.status)) {
      const needUnit = asset.estimatedPrice ?? asset.actualPrice;
      if (needUnit != null) row.need += needUnit * asset.quantity;
      if (assetHasNoPrice(asset)) row.noPrice += 1;
    }
  }

  const needTotal = buckets.inventoryNeed;
  const difference = actualTotal - estimatedTotal;
  const overallVariance = variancePct(actualTotal, estimatedTotal);

  const bucketRows: SmartBudgetBucketRow[] = SMART_BUDGET_BUCKET_ORDER.map(
    (id) => {
      const b = byBucket.get(id)!;
      return {
        id,
        label: SMART_BUDGET_BUCKET_LABELS[id],
        count: b.count,
        estimated: b.estimated,
        actual: b.actual,
        need: b.need,
        noPrice: b.noPrice,
        difference: b.actual - b.estimated,
        variancePct: variancePct(b.actual, b.estimated),
      };
    }
  );

  const waterfall: SmartBudgetWaterfallStep[] = [
    {
      id: "estimated",
      label: "ประเมินรวม (จาก Checklist)",
      amount: estimatedTotal,
      kind: "total",
    },
    {
      id: "actual",
      label: "ซื้อจริงแล้ว",
      amount: actualTotal,
      kind: "spend",
    },
    {
      id: "need",
      label: "ยังต้องจัดหา",
      amount: needTotal,
      kind: "need",
    },
    {
      id: "difference",
      label: "ส่วนต่าง (จริง − ประเมิน)",
      amount: difference,
      kind: "diff",
    },
  ];

  return {
    estimatedTotal,
    actualTotal,
    needTotal,
    difference,
    variancePct: overallVariance,
    unknownPriceCount: buckets.countNoPrice,
    itemCount: assets.length,
    buckets: bucketRows,
    waterfall,
  };
}

export function smartBudgetDisclaimer() {
  return "คำนวณจากรายการเตรียมเปิดร้านเท่านั้น · ไม่ใช้เงินลงทุนเป็นฐาน";
}
