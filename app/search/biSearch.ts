/**
 * Global BI search index — built from Tang Tao seed only.
 * No database.
 */

import {
  OPENING_ASSETS,
  OPENING_BUDGET_ITEMS,
  OPENING_CHECKLIST,
  OPENING_DOCUMENTS,
  OPENING_INITIAL_STOCK,
  OPENING_QUOTES,
  PARTNERS,
  QUOTE_COMPARE_GROUPS,
  SUPPLIERS,
} from "../../data/seed/tangtao";

export type SearchGroupId =
  | "assets"
  | "stock"
  | "suppliers"
  | "partners"
  | "budget"
  | "checklist"
  | "documents"
  | "quotes";

export type SearchHit = {
  id: string;
  group: SearchGroupId;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string;
};

export const SEARCH_GROUP_LABELS: Record<SearchGroupId, string> = {
  assets: "Assets",
  stock: "Initial Stock",
  suppliers: "Supplier",
  partners: "Partners",
  budget: "Budget",
  checklist: "Checklist",
  documents: "Documents",
  quotes: "Quote",
};

export const SEARCH_GROUP_ORDER: SearchGroupId[] = [
  "assets",
  "stock",
  "suppliers",
  "partners",
  "budget",
  "checklist",
  "documents",
  "quotes",
];

function buildIndex(): SearchHit[] {
  const hits: SearchHit[] = [];

  for (const asset of OPENING_ASSETS) {
    hits.push({
      id: `asset-${asset.id}`,
      group: "assets",
      title: asset.name,
      subtitle: asset.category,
      href: `/opening/assets/${asset.id}`,
      keywords: `${asset.name} ${asset.category} อุปกรณ์ ทรัพย์สิน`,
    });
  }

  for (const item of OPENING_INITIAL_STOCK) {
    hits.push({
      id: `stock-${item.id}`,
      group: "stock",
      title: item.name,
      subtitle: `${item.quantity} ${item.unit}`,
      href: "/opening/initial-stock",
      keywords: `${item.name} วัตถุดิบ stock`,
    });
  }

  for (const supplier of SUPPLIERS) {
    hits.push({
      id: `sup-${supplier.id}`,
      group: "suppliers",
      title: supplier.name,
      subtitle: supplier.category,
      href: "/quotes",
      keywords: `${supplier.name} ${supplier.category} ${supplier.note} supplier`,
    });
  }

  for (const partner of PARTNERS) {
    hits.push({
      id: `partner-${partner.id}`,
      group: "partners",
      title: partner.name,
      subtitle: partner.role,
      href: "/partners",
      keywords: `${partner.name} ${partner.role} หุ้นส่วน partner`,
    });
  }

  for (const item of OPENING_BUDGET_ITEMS) {
    hits.push({
      id: `budget-${item.id}`,
      group: "budget",
      title: item.name,
      subtitle: item.category,
      href: "/opening/budget",
      keywords: `${item.name} ${item.category} budget งบ`,
    });
  }

  for (const item of OPENING_CHECKLIST) {
    hits.push({
      id: `check-${item.id}`,
      group: "checklist",
      title: item.label,
      subtitle: item.done ? "เสร็จแล้ว" : "ยังไม่เสร็จ",
      href: "/opening/checklist",
      keywords: `${item.label} checklist ตรวจสอบ`,
    });
  }

  for (const doc of OPENING_DOCUMENTS) {
    hits.push({
      id: `doc-${doc.id}`,
      group: "documents",
      title: doc.title,
      subtitle: doc.parentName,
      href: "/opening/documents",
      keywords: `${doc.title} ${doc.parentName} ${doc.kind} document เอกสาร`,
    });
  }

  for (const quote of OPENING_QUOTES) {
    hits.push({
      id: `quote-doc-${quote.id}`,
      group: "quotes",
      title: quote.title,
      subtitle: `${quote.vendor} · ${quote.parentName}`,
      href: "/quotes",
      keywords: `${quote.title} ${quote.vendor} ${quote.parentName} quote ใบเสนอราคา`,
    });
  }

  for (const group of QUOTE_COMPARE_GROUPS) {
    for (const option of group.options) {
      hits.push({
        id: `quote-opt-${option.id}`,
        group: "quotes",
        title: `${group.itemName} · ${option.vendor}`,
        subtitle: `${option.amount} บาท`,
        href: "/quotes",
        keywords: `${group.itemName} ${option.vendor} ${option.note ?? ""} quote`,
      });
    }
  }

  return hits;
}

const SEARCH_INDEX = buildIndex();

export type SearchGroupResult = {
  group: SearchGroupId;
  label: string;
  hits: SearchHit[];
};

export function searchSeed(query: string): SearchGroupResult[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return SEARCH_GROUP_ORDER.map((group) => ({
      group,
      label: SEARCH_GROUP_LABELS[group],
      hits: SEARCH_INDEX.filter((hit) => hit.group === group).slice(0, 4),
    })).filter((g) => g.hits.length > 0);
  }

  const matched = SEARCH_INDEX.filter((hit) => {
    const hay = `${hit.title} ${hit.subtitle ?? ""} ${hit.keywords}`.toLowerCase();
    return hay.includes(q);
  });

  return SEARCH_GROUP_ORDER.map((group) => ({
    group,
    label: SEARCH_GROUP_LABELS[group],
    hits: matched.filter((hit) => hit.group === group),
  })).filter((g) => g.hits.length > 0);
}

export function getSearchIndexCount() {
  return SEARCH_INDEX.length;
}
