/**
 * Opening OS domain — one dataset (bi_assets via AssetProvider), many views.
 * Checklist topics + readiness/budget summary share the same calculations.
 */

import type { AssetItem, AssetStatus } from "../../../data/seed/tangtao";
import {
  ASSET_STATUS_LABELS,
  isAssetOrdered,
  isAssetOwned,
  isAssetPlannedSpend,
  assetHasNoPrice,
} from "../../../data/seed/tangtao";
import { buildInventoryBuckets } from "../../../lib/services/inventoryRollup";

export type OpeningTopicId =
  | "equipment"
  | "ingredients"
  | "packaging"
  | "team"
  | "documents"
  | "suppliers";

export type OpeningUxStatus =
  | "owned"
  | "need"
  | "ordered"
  | "received"
  | "other";

export type OpeningTopic = {
  id: OpeningTopicId;
  title: string;
  href: string;
  /** External page when topic is not an asset list */
  externalHref?: string;
  description: string;
};

export const OPENING_TOPICS: OpeningTopic[] = [
  {
    id: "equipment",
    title: "อุปกรณ์",
    href: "/opening/checklist/equipment",
    description: "เครื่องใช้ อุปกรณ์ครัว และของใช้เปิดร้าน",
  },
  {
    id: "ingredients",
    title: "วัตถุดิบ",
    href: "/opening/checklist/ingredients",
    description: "ซอส เนื้อ และวัตถุดิบเริ่มต้น",
  },
  {
    id: "packaging",
    title: "บรรจุภัณฑ์",
    href: "/opening/checklist/packaging",
    description: "กล่อง ถุง และของบรรจุ",
  },
  {
    id: "team",
    title: "ทีม",
    href: "/opening/checklist/team",
    externalHref: "/opening/team",
    description: "คนและหน้าที่ก่อนเปิดร้าน",
  },
  {
    id: "documents",
    title: "เอกสาร",
    href: "/opening/checklist/documents",
    externalHref: "/opening/documents",
    description: "เอกสารที่ต้องเตรียมก่อนเปิด",
  },
  {
    id: "suppliers",
    title: "Supplier",
    href: "/opening/checklist/suppliers",
    description: "ร้านซื้อ / ผู้จัดหาที่ผูกกับรายการ",
  },
];

const INGREDIENT_CATEGORIES = new Set([
  "ซอสและเครื่องปรุง",
  "เนื้อสัตว์และของแปรรูป",
  "วัตถุดิบเพิ่มเติม",
]);

const PACKAGING_CATEGORIES = new Set([
  "บรรจุภัณฑ์",
  "กล่องและบรรจุ",
]);

export function getTopic(id: string): OpeningTopic | null {
  return OPENING_TOPICS.find((t) => t.id === id) ?? null;
}

export function uxStatusOf(status: AssetStatus): OpeningUxStatus {
  if (isAssetOwned(status)) return "owned";
  if (status === "received") return "received";
  if (isAssetOrdered(status)) return "ordered";
  if (isAssetPlannedSpend(status)) return "need";
  return "other";
}

export function uxStatusLabel(status: AssetStatus): string {
  const ux = uxStatusOf(status);
  if (ux === "owned") return "มีแล้ว";
  if (ux === "received") return "ได้รับแล้ว";
  if (ux === "ordered") return "สั่งแล้ว";
  if (ux === "need") return "ต้องจัดหา";
  return ASSET_STATUS_LABELS[status];
}

/** Item is “ready for opening” on that line */
export function isItemReady(status: AssetStatus): boolean {
  return status === "in_use" || status === "received";
}

export function isItemRemaining(status: AssetStatus): boolean {
  return !isItemReady(status);
}

function isEquipmentCategory(category: string) {
  return (
    !INGREDIENT_CATEGORIES.has(category) && !PACKAGING_CATEGORIES.has(category)
  );
}

/** Assets belonging to a checklist topic (same bi_assets rows). */
export function assetsForTopic(
  assets: AssetItem[],
  topicId: OpeningTopicId
): AssetItem[] {
  switch (topicId) {
    case "ingredients":
      return assets.filter((a) => INGREDIENT_CATEGORIES.has(a.category));
    case "packaging":
      return assets.filter((a) => PACKAGING_CATEGORIES.has(a.category));
    case "equipment":
      return assets.filter((a) => isEquipmentCategory(a.category));
    case "suppliers":
      return assets.filter((a) => a.supplier.trim().length > 0);
    case "team":
    case "documents":
      return [];
    default:
      return [];
  }
}

export type TopicProgress = {
  topic: OpeningTopic;
  total: number;
  ready: number;
  remaining: number;
  need: number;
  ordered: number;
  owned: number;
  received: number;
  noPrice: number;
  percent: number;
  /** Topic managed on another screen */
  isExternal: boolean;
};

export function topicProgress(
  assets: AssetItem[],
  topic: OpeningTopic
): TopicProgress {
  const rows = assetsForTopic(assets, topic.id);
  const ready = rows.filter((a) => isItemReady(a.status)).length;
  const remaining = rows.filter((a) => isItemRemaining(a.status)).length;
  const need = rows.filter((a) => isAssetPlannedSpend(a.status)).length;
  const ordered = rows.filter((a) => isAssetOrdered(a.status)).length;
  const owned = rows.filter((a) => isAssetOwned(a.status)).length;
  const received = rows.filter((a) => a.status === "received").length;
  const noPrice = rows.filter((a) => assetHasNoPrice(a)).length;
  const total = rows.length;
  const percent = total === 0 ? 0 : Math.round((ready / total) * 100);
  return {
    topic,
    total,
    ready,
    remaining,
    need,
    ordered,
    owned,
    received,
    noPrice,
    percent,
    isExternal: Boolean(topic.externalHref),
  };
}

export type OpeningSummary = {
  readyPercent: number;
  remainingCount: number;
  readyCount: number;
  totalCount: number;
  moneyNeeded: number;
  noPriceCount: number;
  inventoryTotal: number;
  inventoryOwned: number;
  inventoryActualSpend: number;
  /** Shared rollup lines — Budget/Assets views must reuse, not recompute differently */
  buckets: ReturnType<typeof buildInventoryBuckets>;
};

/**
 * Single summary for Hub / Checklist / Budget / Assets views.
 * Always derived from the same asset list (One Thing, One Place · Zero Duplicate).
 */
export function buildOpeningSummary(assets: AssetItem[]): OpeningSummary {
  const active = assets;
  const totalCount = active.length;
  const readyCount = active.filter((a) => isItemReady(a.status)).length;
  const remainingCount = active.filter((a) => isItemRemaining(a.status)).length;
  const buckets = buildInventoryBuckets(active);
  const readyPercent =
    totalCount === 0 ? 0 : Math.round((readyCount / totalCount) * 100);

  return {
    readyPercent,
    remainingCount,
    readyCount,
    totalCount,
    moneyNeeded: buckets.inventoryNeed,
    noPriceCount: buckets.countNoPrice,
    inventoryTotal: buckets.inventoryTotal,
    inventoryOwned: buckets.inventoryOwned,
    inventoryActualSpend: buckets.inventoryActualSpend,
    buckets,
  };
}

export function nextOpeningFocus(assets: AssetItem[]): {
  message: string;
  href: string;
} {
  const noPrice = assets.find((a) => assetHasNoPrice(a));
  if (noPrice) {
    return {
      message: `ใส่ราคา “${noPrice.name}” — งบสรุปจะครบขึ้น`,
      href: `/opening/assets/${noPrice.id}/edit`,
    };
  }
  for (const topic of OPENING_TOPICS) {
    const p = topicProgress(assets, topic);
    if (p.isExternal) continue;
    if (p.remaining > 0) {
      return {
        message: `เคลียร์หมวด${topic.title} — เหลือ ${p.remaining} รายการ`,
        href: topic.href,
      };
    }
  }
  const team = OPENING_TOPICS.find((t) => t.id === "team");
  return {
    message: "รายการหลักเคลียร์แล้ว — ตรวจทีมและเอกสารก่อนเปิด",
    href: team?.externalHref ?? "/opening",
  };
}

/**
 * Hub checklist preview — up to `limit` items that still need attention.
 * Priority: missing price → must remaining → other remaining.
 */
export function previewChecklistItems(
  assets: AssetItem[],
  limit = 5
): AssetItem[] {
  const remaining = assets.filter((a) => isItemRemaining(a.status));
  const scored = remaining.map((a) => {
    let score = 0;
    if (assetHasNoPrice(a)) score += 100;
    if (a.priority === "must") score += 50;
    else if (a.priority === "should") score += 25;
    if (isAssetPlannedSpend(a.status)) score += 10;
    return { a, score };
  });
  scored.sort((x, y) => {
    if (y.score !== x.score) return y.score - x.score;
    return x.a.name.localeCompare(y.a.name, "th");
  });
  return scored.slice(0, limit).map((s) => s.a);
}

/**
 * Default category for Quick Add on a checklist topic.
 * Must match assetsForTopic filters (no schema change).
 */
export function defaultCategoryForTopic(topicId: OpeningTopicId): string {
  switch (topicId) {
    case "ingredients":
      return "ซอสและเครื่องปรุง";
    case "packaging":
      return "บรรจุภัณฑ์";
    case "equipment":
      return "ของใช้ในครัว";
    case "suppliers":
      return "อื่นๆ";
    default:
      return "อื่นๆ";
  }
}

export type StatusFilter = "all" | OpeningUxStatus;

export function filterByUxStatus(
  assets: AssetItem[],
  filter: StatusFilter
): AssetItem[] {
  if (filter === "all") return assets;
  return assets.filter((a) => uxStatusOf(a.status) === filter);
}
