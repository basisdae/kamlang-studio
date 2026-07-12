/**
 * Procurement workflow — same bi_assets as Checklist (view, not a second dataset).
 * Extra fields live in specifications.procurement (JSON already on bi_assets).
 */

import type { AssetItem, AssetStatus } from "../../../data/seed/tangtao";
import {
  assetHasNoPrice,
  isAssetOrdered,
  isAssetPlannedSpend,
} from "../../../data/seed/tangtao";
import { buildInventoryBuckets } from "../../../lib/services/inventoryRollup";
import {
  emptyProcurementMeta,
  parseProcurementMeta,
  type ProcurementMeta,
  type ProcurementQuote,
} from "../../../lib/types/procurement";

export type { ProcurementMeta, ProcurementQuote };
export { emptyProcurementMeta };

export type ProcurementStage =
  | "request_quote"
  | "compare"
  | "ready_to_order"
  | "outstanding"
  | "received";

export type ProcurementStageFilter = "all" | ProcurementStage;

export const PROCUREMENT_STAGE_LABELS: Record<ProcurementStage, string> = {
  request_quote: "ขอราคา",
  compare: "เปรียบเทียบ",
  ready_to_order: "พร้อมสั่ง",
  outstanding: "สั่งแล้ว",
  received: "ได้รับแล้ว",
};

export function readProcurementMeta(asset: AssetItem): ProcurementMeta {
  const meta = parseProcurementMeta(asset.procurement);
  if (!meta.attachmentUrl && asset.purchaseUrl) {
    return { ...meta, attachmentUrl: asset.purchaseUrl };
  }
  return meta;
}

export function newQuoteId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Items that participate in procurement (need buy or in order/receive flow) */
export function isProcurementItem(asset: AssetItem): boolean {
  if (isAssetPlannedSpend(asset.status)) return true;
  if (isAssetOrdered(asset.status)) return true;
  if (asset.status === "received") return true;
  return false;
}

export function procurementStageOf(asset: AssetItem): ProcurementStage {
  const meta = readProcurementMeta(asset);
  if (asset.status === "received" || asset.status === "in_use") {
    return "received";
  }
  if (isAssetOrdered(asset.status)) return "outstanding";
  if (asset.status === "ready_to_buy") return "ready_to_order";
  if (meta.quotes.length >= 2) return "compare";
  if (asset.status === "awaiting_quote" || asset.status === "planned") {
    return "request_quote";
  }
  if (assetHasNoPrice(asset)) return "request_quote";
  return "ready_to_order";
}

export function filterByProcurementStage(
  assets: AssetItem[],
  filter: ProcurementStageFilter
): AssetItem[] {
  const rows = assets.filter(isProcurementItem);
  if (filter === "all") return rows;
  return rows.filter((a) => procurementStageOf(a) === filter);
}

export type ProcurementSummary = {
  requestQuote: number;
  compare: number;
  readyToOrder: number;
  outstanding: number;
  received: number;
  needSpend: number;
  outstandingSpend: number;
  unknownPrice: number;
};

export function buildProcurementSummary(
  assets: AssetItem[]
): ProcurementSummary {
  const rows = assets.filter(isProcurementItem);
  const buckets = buildInventoryBuckets(assets);
  let requestQuote = 0;
  let compare = 0;
  let readyToOrder = 0;
  let outstanding = 0;
  let received = 0;
  let outstandingSpend = 0;
  for (const a of rows) {
    const stage = procurementStageOf(a);
    if (stage === "request_quote") requestQuote += 1;
    else if (stage === "compare") compare += 1;
    else if (stage === "ready_to_order") readyToOrder += 1;
    else if (stage === "outstanding") {
      outstanding += 1;
      const unit = a.actualPrice ?? a.estimatedPrice;
      if (unit != null) outstandingSpend += unit * a.quantity;
    } else if (stage === "received") received += 1;
  }
  return {
    requestQuote,
    compare,
    readyToOrder,
    outstanding,
    received,
    needSpend: buckets.inventoryNeed,
    outstandingSpend,
    unknownPrice: buckets.countNoPrice,
  };
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function nextProcurementAction(asset: AssetItem): {
  label: string;
  status?: AssetStatus;
} {
  const stage = procurementStageOf(asset);
  if (stage === "request_quote") {
    return { label: "ขอราคา", status: "awaiting_quote" };
  }
  if (stage === "compare") {
    return { label: "เลือกผู้ขาย" };
  }
  if (stage === "ready_to_order") {
    return { label: "สั่งซื้อ", status: "ordered" };
  }
  if (stage === "outstanding") {
    return { label: "ได้รับแล้ว", status: "received" };
  }
  return { label: "ดูรายละเอียด" };
}
