/**
 * Partners Shared Core access layer.
 *
 * Read/write only through Supabase `bi_partners` — no localStorage SSoT.
 * Until the table + repository exist, exports are Temporary Readonly (empty).
 */

import {
  PARTNERS_SHARED_CORE_READY,
  PARTNERS_SHARED_CORE_TABLE,
  type PartnerRecord,
} from "./types";

export type PartnersSummary = {
  total: number;
  active: number;
  supplier: number;
  investor: number;
};

export type PartnerWriteInput = {
  name: string;
  category: PartnerRecord["category"];
  status: PartnerRecord["status"];
  role?: string;
  note?: string;
  investment?: number | null;
  percent?: number | null;
};

export const PARTNERS_READONLY_REASON =
  `รอ Shared Core (${PARTNERS_SHARED_CORE_TABLE}) — ยังไม่มีตารางใน Supabase`;

export function isPartnersWritable(): boolean {
  return PARTNERS_SHARED_CORE_READY;
}

/** Temporary Readonly — returns [] until bi_partners repository is wired. */
export function listPartners(_includeArchived = false): PartnerRecord[] {
  if (!PARTNERS_SHARED_CORE_READY) return [];
  return [];
}

export function buildPartnersSummary(
  partners: PartnerRecord[] = listPartners()
): PartnersSummary {
  const activeRows = partners.filter((p) => !p.isArchived);
  return {
    total: activeRows.length,
    active: activeRows.filter((p) => p.status === "active").length,
    supplier: activeRows.filter((p) => p.category === "Supplier").length,
    investor: activeRows.filter((p) => p.category === "Investor").length,
  };
}

export function getEmptyPartnersSummary(): PartnersSummary {
  return { total: 0, active: 0, supplier: 0, investor: 0 };
}
