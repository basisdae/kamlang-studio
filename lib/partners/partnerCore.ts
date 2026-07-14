/**
 * Partners Shared Core helpers — summary + write input re-exports.
 * Persistence goes through partnerService → bi_partners.
 */

import {
  partnerCategoryLabel,
  type PartnerRecord,
} from "./types";
export type { PartnerWriteInput } from "../mappers/partnerMapper";

export type PartnersSummary = {
  total: number;
  active: number;
  /** Counts keyed by display label — ready for dynamic categories */
  byCategory: Record<string, number>;
};

export function buildPartnersSummary(
  partners: PartnerRecord[]
): PartnersSummary {
  const activeRows = partners.filter((p) => !p.isArchived);
  const byCategory: Record<string, number> = {};
  for (const row of activeRows) {
    const label = partnerCategoryLabel(row.category);
    byCategory[label] = (byCategory[label] ?? 0) + 1;
  }
  return {
    total: activeRows.length,
    active: activeRows.filter((p) => p.status === "active").length,
    byCategory,
  };
}

export function getEmptyPartnersSummary(): PartnersSummary {
  return { total: 0, active: 0, byCategory: {} };
}
