/**
 * Opening Recommendation Engine — rule-based only (no AI).
 * Input: live bi_assets (same Checklist SSoT).
 */

import type { AssetItem } from "../../../data/seed/tangtao";
import {
  assetHasNoPrice,
  isAssetOrdered,
} from "../../../data/seed/tangtao";
import {
  KNOWLEDGE_RULES,
  MISSING_ITEM_RULES,
  RELATED_ITEM_RULES,
  SUPPLIER_RULES,
  type RecKind,
} from "./recommendationCatalog";

export type Recommendation = {
  id: string;
  kind: RecKind;
  title: string;
  note: string;
  warning?: string;
  reason: string;
  score: number;
  linkHref?: string;
  linkLabel?: string;
  /** For Quick Add / create */
  suggestName?: string;
  suggestCategory?: string;
  suggestSupplier?: string;
};

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function assetBlob(asset: AssetItem) {
  return normalize(
    `${asset.name} ${asset.category} ${asset.brand} ${asset.model} ${asset.note}`
  );
}

function corpus(assets: AssetItem[]) {
  return assets.map(assetBlob).join(" \n ");
}

function hasKeyword(text: string, keyword: string) {
  const k = normalize(keyword);
  if (!k) return false;
  return text.includes(k);
}

function hasAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((k) => hasKeyword(text, k));
}

function alreadySuggestedName(assets: AssetItem[], name: string) {
  const n = normalize(name);
  return assets.some((a) => normalize(a.name).includes(n) || n.includes(normalize(a.name)));
}

/**
 * Evaluate all rule catalogs against current Checklist assets.
 */
export function buildRecommendations(
  assets: AssetItem[],
  limit = 8
): Recommendation[] {
  const text = corpus(assets);
  const out: Recommendation[] = [];

  // --- Missing items ---
  for (const rule of MISSING_ITEM_RULES) {
    const present = hasAnyKeyword(text, rule.presentKeywords);
    if (present) continue;
    if (alreadySuggestedName(assets, rule.suggestName)) continue;
    out.push({
      id: rule.id,
      kind: "missing",
      title: `ยังขาด: ${rule.suggestName}`,
      note: rule.note,
      warning: rule.warning,
      reason: "ไม่พบรายการที่เกี่ยวข้องใน Checklist",
      score: rule.score,
      linkHref: rule.linkHref ?? "/opening/assets/new",
      linkLabel: rule.linkLabel ?? "เพิ่มรายการ",
      suggestName: rule.suggestName,
      suggestCategory: rule.category,
    });
  }

  // --- Related items ---
  for (const rule of RELATED_ITEM_RULES) {
    if (!hasAnyKeyword(text, rule.whenKeywords)) continue;
    if (hasAnyKeyword(text, rule.unlessKeywords)) continue;
    if (alreadySuggestedName(assets, rule.suggestName)) continue;
    out.push({
      id: rule.id,
      kind: "related",
      title: `ควรมีคู่กัน: ${rule.suggestName}`,
      note: rule.note,
      warning: rule.warning,
      reason: `พบรายการที่เกี่ยวกับ “${rule.whenKeywords[0]}”`,
      score: rule.score,
      linkHref: rule.linkHref,
      linkLabel: rule.linkLabel,
      suggestName: rule.suggestName,
      suggestCategory: rule.category,
    });
  }

  // --- Supplier recommendations ---
  const supplierSeen = new Set<string>();
  for (const rule of SUPPLIER_RULES) {
    if (!hasAnyKeyword(text, rule.forKeywords)) continue;
    if (supplierSeen.has(rule.supplierName)) continue;
    // Skip if every matching asset already has this supplier
    const relevant = assets.filter((a) =>
      hasAnyKeyword(assetBlob(a), rule.forKeywords)
    );
    if (
      relevant.length > 0 &&
      relevant.every((a) => normalize(a.supplier).includes(normalize(rule.supplierName)))
    ) {
      continue;
    }
    supplierSeen.add(rule.supplierName);
    out.push({
      id: rule.id,
      kind: "supplier",
      title: `Supplier: ${rule.supplierName}`,
      note: rule.note,
      warning: rule.warning,
      reason: "ตรงกับหมวด/รายการใน Checklist",
      score: rule.score,
      linkHref: rule.linkHref,
      linkLabel: rule.linkLabel,
      suggestSupplier: rule.supplierName,
    });
  }

  // --- Warnings from live data ---
  const noPriceCount = assets.filter((a) => assetHasNoPrice(a)).length;
  if (noPriceCount > 0) {
    out.push({
      id: "warn-no-price",
      kind: "warning",
      title: `มี ${noPriceCount} รายการยังไม่ใส่ราคา`,
      note: "งบและจัดหาจะแม่นขึ้นเมื่อใส่ราคาประเมิน",
      warning: "สรุปงบอาจต่ำกว่าของจริง",
      reason: "ตรวจจากราคาใน bi_assets",
      score: 88,
      linkHref: "/opening/budget",
      linkLabel: "ไปงบประมาณ",
    });
  }

  const orderedNoSupplier = assets.filter(
    (a) => isAssetOrdered(a.status) && !a.supplier.trim()
  );
  if (orderedNoSupplier.length > 0) {
    out.push({
      id: "warn-order-supplier",
      kind: "warning",
      title: `${orderedNoSupplier.length} รายการสั่งแล้วแต่ไม่มี Supplier`,
      note: "ใส่ร้านซื้อเพื่อติดตามของและบิล",
      warning: "ของค้างรับอาจตามยาก",
      reason: "สถานะสั่งแล้ว · supplier ว่าง",
      score: 84,
      linkHref: "/opening/procurement?stage=outstanding",
      linkLabel: "ดูของค้างรับ",
    });
  }

  // --- Knowledge cards ---
  for (const rule of KNOWLEDGE_RULES) {
    if (rule.whenKeywords?.includes("*no_price*")) continue; // handled above
    if (rule.whenKeywords?.includes("*ordered_no_supplier*")) continue;

    if (rule.whenKeywords && rule.whenKeywords.length > 0) {
      if (!hasAnyKeyword(text, rule.whenKeywords)) continue;
    }
    if (rule.whenMissingKeywords && rule.whenMissingKeywords.length > 0) {
      if (hasAnyKeyword(text, rule.whenMissingKeywords)) continue;
    }

    out.push({
      id: rule.id,
      kind: rule.kind ?? "knowledge",
      title: rule.title,
      note: rule.note,
      warning: rule.warning,
      reason: "Knowledge rule",
      score: rule.score,
      linkHref: rule.linkHref,
      linkLabel: rule.linkLabel,
    });
  }

  // Empty checklist — nudge
  if (assets.length === 0) {
    out.push({
      id: "empty-start",
      kind: "knowledge",
      title: "เริ่มจากรายการ Must Have",
      note: "เพิ่มเตา · POS · ตู้โชว์ · Packaging · วัตถุดิบหลัก แล้วระบบจะแนะนำของที่ยังขาด",
      reason: "Checklist ว่าง",
      score: 120,
      linkHref: "/opening/assets/new",
      linkLabel: "+ เพิ่มรายการ",
      suggestName: "เตาโตเกียว",
      suggestCategory: "อุปกรณ์ทำขนมโตเกียว",
    });
  }

  out.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "th"));

  // Dedupe by id
  const seen = new Set<string>();
  const unique: Recommendation[] = [];
  for (const r of out) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    unique.push(r);
  }

  return unique.slice(0, limit);
}

export const REC_KIND_LABELS: Record<RecKind, string> = {
  missing: "ของที่ขาด",
  related: "ของที่เกี่ยวข้อง",
  supplier: "Supplier",
  knowledge: "ความรู้",
  warning: "คำเตือน",
};
