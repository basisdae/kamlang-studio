/**
 * Re-export Tang Tao seed + document helpers.
 * Clean-start: no mock documents / quotes.
 */

export {
  WORKSPACE_NAME,
  type DocumentKind,
  type DocumentParentType,
  type OpeningDocument,
  type QuoteDocument,
} from "../../../data/seed/tangtao";

import type {
  DocumentKind,
  DocumentParentType,
  OpeningDocument,
  QuoteDocument,
} from "../../../data/seed/tangtao";
import {
  OPENING_DOCUMENTS as SEED_OPENING_DOCUMENTS,
  OPENING_QUOTES as SEED_OPENING_QUOTES,
} from "../../../data/seed/tangtao";
import { isCleanStart } from "../../../lib/bi/cleanStart";

export const OPENING_DOCUMENTS: OpeningDocument[] = isCleanStart()
  ? []
  : SEED_OPENING_DOCUMENTS;
export const OPENING_QUOTES: QuoteDocument[] = isCleanStart()
  ? []
  : SEED_OPENING_QUOTES;

export const KIND_LABELS: Record<DocumentKind, string> = {
  image: "รูป",
  pdf: "PDF",
  quote: "ใบเสนอราคา",
  receipt: "ใบเสร็จ",
  warranty: "Warranty",
  serial: "Serial Number",
};

export const PARENT_TYPE_LABELS: Record<DocumentParentType, string> = {
  asset: "ทรัพย์สิน",
  budget: "งบประมาณ",
  initial_stock: "วัตถุดิบเริ่มต้น",
};

export const ATTACHABLE_KINDS: DocumentKind[] = [
  "image",
  "pdf",
  "quote",
  "receipt",
  "warranty",
  "serial",
];

export type DocumentParentGroup = {
  parentType: DocumentParentType;
  parentId: string;
  parentName: string;
  documents: OpeningDocument[];
};

export function groupDocumentsByParent(
  docs: OpeningDocument[] = OPENING_DOCUMENTS
): DocumentParentGroup[] {
  const map = new Map<string, DocumentParentGroup>();

  for (const doc of docs) {
    const key = `${doc.parentType}:${doc.parentId}`;
    const existing = map.get(key);
    if (existing) {
      existing.documents.push(doc);
    } else {
      map.set(key, {
        parentType: doc.parentType,
        parentId: doc.parentId,
        parentName: doc.parentName,
        documents: [doc],
      });
    }
  }

  return [...map.values()];
}

export function getDocumentsSummary(
  docs: OpeningDocument[] = OPENING_DOCUMENTS
) {
  const byKind = ATTACHABLE_KINDS.reduce(
    (acc, kind) => {
      acc[kind] = docs.filter((d) => d.kind === kind).length;
      return acc;
    },
    {} as Record<DocumentKind, number>
  );

  return {
    total: docs.length,
    quoteCount: OPENING_QUOTES.length,
    byKind,
    byParent: {
      asset: docs.filter((d) => d.parentType === "asset").length,
      budget: docs.filter((d) => d.parentType === "budget").length,
      initial_stock: docs.filter((d) => d.parentType === "initial_stock")
        .length,
    },
    parentsWithDocs: groupDocumentsByParent(docs).length,
  };
}

export function formatDocTime(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
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

export function formatDocDay(dateKey: string) {
  return formatDocTime(`${dateKey}T12:00:00+07:00`);
}
