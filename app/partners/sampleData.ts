/**
 * Re-export Tang Tao seed + partner helpers.
 * Source of truth: data/seed/tangtao.ts
 */

export {
  PARTNERS,
  WORKSPACE_NAME,
  type Partner,
  type PartnerStatus,
} from "../../data/seed/tangtao";

import type { Partner, PartnerStatus } from "../../data/seed/tangtao";
import { PARTNERS } from "../../data/seed/tangtao";

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  active: "ทำงานอยู่",
  pending: "รอยืนยัน",
  paused: "พักไว้",
};

export function getPartnersSummary(partners: Partner[] = PARTNERS) {
  const totalInvestment = partners.reduce((s, p) => s + p.investment, 0);
  const totalPercent = partners.reduce((s, p) => s + p.percent, 0);
  const activeCount = partners.filter((p) => p.status === "active").length;

  return {
    count: partners.length,
    totalInvestment,
    totalPercent,
    activeCount,
  };
}
