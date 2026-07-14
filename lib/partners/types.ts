/**
 * Partners — Shared Core entity (business-scoped, not Workspace-owned).
 *
 * Mental model:
 * - One Partner list per Business/Tenant; every Workspace references the same set.
 * - Not a Finance Module — Finance may link here but does not own Partner data.
 * - Single `category` field (no parallel tables per type).
 *
 * Storage: Supabase `bi_partners` when Shared Core ships (not localStorage).
 */

export const PARTNERS_SHARED_CORE_TABLE = "bi_partners";

/** True when `bi_partners` exists and repository is wired — false until migration lands. */
export const PARTNERS_SHARED_CORE_READY = false;

export const PARTNER_CATEGORIES = [
  "Supplier",
  "Factory",
  "Agency",
  "Printer",
  "Investor",
  "Freelancer",
  "Designer",
  "Contractor",
] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

export type PartnerStatus = "active" | "pending" | "paused";

export type PartnerRecord = {
  id: string;
  name: string;
  category: PartnerCategory;
  status: PartnerStatus;
  /** Short role / title */
  role: string;
  note: string;
  /** Optional — for Investor / equity-style partners */
  investment: number | null;
  percent: number | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  active: "Active",
  pending: "รอยืนยัน",
  paused: "พักไว้",
};

export function isPartnerCategory(value: string): value is PartnerCategory {
  return (PARTNER_CATEGORIES as readonly string[]).includes(value);
}
