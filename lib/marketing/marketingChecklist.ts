/**
 * Marketing Readiness — Checklist topics on the same bi_assets Module as Opening.
 * Categories only; no Campaign Module.
 */

import type { AssetItem, AssetStatus } from "../../data/seed/tangtao";
import {
  assetHasNoPrice,
  isAssetOrdered,
  isAssetOwned,
  isAssetPlannedSpend,
} from "../../data/seed/tangtao";

export type MarketingTopicId =
  | "mkt-storefront"
  | "mkt-online"
  | "mkt-branding"
  | "mkt-print"
  | "mkt-promotion"
  | "mkt-content";

export type MarketingChecklistTopic = {
  id: MarketingTopicId;
  title: string;
  href: string;
  description: string;
};

/** Exact bi_assets.category values for Marketing checklist rows */
export const MARKETING_CATEGORIES = {
  "mkt-storefront": "การตลาด·หน้าร้าน",
  "mkt-online": "การตลาด·ออนไลน์",
  "mkt-branding": "การตลาด·Branding",
  "mkt-print": "การตลาด·สิ่งพิมพ์",
  "mkt-promotion": "การตลาด·Promotion",
  "mkt-content": "การตลาด·Content",
} as const satisfies Record<MarketingTopicId, string>;

export const MARKETING_CATEGORY_SET = new Set<string>(
  Object.values(MARKETING_CATEGORIES)
);

export function isMarketingCategory(category: string): boolean {
  return MARKETING_CATEGORY_SET.has(category);
}

export function isMarketingTopicId(id: string): id is MarketingTopicId {
  return Object.prototype.hasOwnProperty.call(MARKETING_CATEGORIES, id);
}

function isItemReady(status: AssetStatus): boolean {
  return status === "in_use" || status === "received";
}

function isItemRemaining(status: AssetStatus): boolean {
  return !isItemReady(status);
}

export const MARKETING_TOPICS: MarketingChecklistTopic[] = [
  {
    id: "mkt-storefront",
    title: "หน้าร้าน",
    href: "/opening/checklist/mkt-storefront",
    description: "ป้าย เวลาเปิด QR และเมนูหน้าร้าน",
  },
  {
    id: "mkt-online",
    title: "ออนไลน์",
    href: "/opening/checklist/mkt-online",
    description: "Facebook Maps Grab LINE MAN",
  },
  {
    id: "mkt-branding",
    title: "Branding",
    href: "/opening/checklist/mkt-branding",
    description: "โลโก้ สี และฟอนต์",
  },
  {
    id: "mkt-print",
    title: "สิ่งพิมพ์",
    href: "/opening/checklist/mkt-print",
    description: "เมนูเล่ม โบว์ชัวร์ นามบัตร",
  },
  {
    id: "mkt-promotion",
    title: "Promotion",
    href: "/opening/checklist/mkt-promotion",
    description: "โปรเปิดร้านและชุดอาหาร",
  },
  {
    id: "mkt-content",
    title: "Content",
    href: "/opening/checklist/mkt-content",
    description: "รูป วิดีโอ และ Reel",
  },
];

export const MARKETING_TOPIC_IDS: MarketingTopicId[] = MARKETING_TOPICS.map(
  (t) => t.id
);

/** Starter rows (ร้านอาหาร) — applied on demand, not Campaign data */
export const MARKETING_STARTER_ITEMS: {
  name: string;
  topicId: MarketingTopicId;
}[] = [
  { name: "เมนูเล่ม", topicId: "mkt-print" },
  { name: "เมนูติดผนัง", topicId: "mkt-storefront" },
  { name: "QR PromptPay", topicId: "mkt-storefront" },
  { name: "QR Line OA", topicId: "mkt-online" },
  { name: "Facebook", topicId: "mkt-online" },
  { name: "Google Maps", topicId: "mkt-online" },
  { name: "Grab", topicId: "mkt-online" },
  { name: "LINE MAN", topicId: "mkt-online" },
  { name: "ป้ายร้าน", topicId: "mkt-storefront" },
  { name: "ป้ายโปรโมชั่น", topicId: "mkt-storefront" },
  { name: "โบว์ชัวร์", topicId: "mkt-print" },
  { name: "นามบัตร", topicId: "mkt-print" },
  { name: "Content", topicId: "mkt-content" },
  { name: "Branding", topicId: "mkt-branding" },
  { name: "โปรโมชั่น", topicId: "mkt-promotion" },
  { name: "ของแจก", topicId: "mkt-promotion" },
];

export function marketingAssetsOnly(assets: AssetItem[]): AssetItem[] {
  return assets.filter((a) => isMarketingCategory(a.category));
}

export function assetsForMarketingTopic(
  assets: AssetItem[],
  topicId: MarketingTopicId
): AssetItem[] {
  const category = MARKETING_CATEGORIES[topicId];
  return assets.filter((a) => a.category === category);
}

export type MarketingTopicProgress = {
  topic: MarketingChecklistTopic;
  total: number;
  ready: number;
  remaining: number;
  need: number;
  ordered: number;
  owned: number;
  received: number;
  noPrice: number;
  percent: number;
};

export function marketingTopicProgress(
  assets: AssetItem[],
  topic: MarketingChecklistTopic
): MarketingTopicProgress {
  const rows = assetsForMarketingTopic(assets, topic.id);
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
  };
}

export type MarketingSummary = {
  readyPercent: number;
  remainingCount: number;
  readyCount: number;
  totalCount: number;
};

export function buildMarketingSummary(assets: AssetItem[]): MarketingSummary {
  const rows = marketingAssetsOnly(assets);
  const totalCount = rows.length;
  const readyCount = rows.filter((a) => isItemReady(a.status)).length;
  const remainingCount = rows.filter((a) => isItemRemaining(a.status)).length;
  const readyPercent =
    totalCount === 0 ? 0 : Math.round((readyCount / totalCount) * 100);
  return {
    readyPercent,
    remainingCount,
    readyCount,
    totalCount,
  };
}

export function nextMarketingFocus(assets: AssetItem[]): {
  message: string;
  href: string;
} {
  for (const topic of MARKETING_TOPICS) {
    const p = marketingTopicProgress(assets, topic);
    if (p.total === 0) {
      return {
        message: `เริ่มหมวด${topic.title} — ยังไม่มีรายการ`,
        href: topic.href,
      };
    }
    if (p.remaining > 0) {
      return {
        message: `เคลียร์หมวด${topic.title} — เหลือ ${p.remaining} รายการ`,
        href: topic.href,
      };
    }
  }
  return {
    message: "Marketing Ready แล้ว — ตรวจ Timeline และเอกสารประกอบ",
    href: "/timeline",
  };
}

export function previewMarketingChecklistItems(
  assets: AssetItem[],
  limit = 5
): AssetItem[] {
  const remaining = marketingAssetsOnly(assets).filter((a) =>
    isItemRemaining(a.status)
  );
  const scored = remaining.map((a) => {
    let score = 0;
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

export function defaultCategoryForMarketingTopic(
  topicId: MarketingTopicId
): string {
  return MARKETING_CATEGORIES[topicId];
}

export function getMarketingTopic(id: string): MarketingChecklistTopic | null {
  return MARKETING_TOPICS.find((t) => t.id === id) ?? null;
}
