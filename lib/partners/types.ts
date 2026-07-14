/**
 * Partners — Shared Core entity (business-scoped via bi_workspaces).
 * App Workspaces all reference the same Partner set — never fork by context.
 */

export const PARTNERS_SHARED_CORE_TABLE = "bi_partners";

export const PARTNER_CATEGORIES = [
  "partner",
  "supplier",
  "factory",
  "agency",
  "printer",
  "investor",
  "freelancer",
  "designer",
  "contractor",
  "consultant",
  "service_provider",
  "other",
] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number];

/** Owner-facing labels for Category chips / form */
export const PARTNER_CATEGORY_LABELS: Record<PartnerCategory, string> = {
  partner: "หุ้นส่วน",
  supplier: "Supplier",
  factory: "โรงงาน",
  agency: "Agency",
  printer: "Printer",
  investor: "นักลงทุน",
  freelancer: "Freelancer",
  designer: "Designer",
  contractor: "Contractor",
  consultant: "ที่ปรึกษา",
  service_provider: "ผู้ให้บริการ",
  other: "อื่นๆ",
};

export type PartnerStatus = "active" | "pending" | "paused";

export type PartnerRecord = {
  id: string;
  workspaceId: string;
  name: string;
  category: PartnerCategory;
  contactName: string;
  phone: string;
  email: string;
  lineId: string;
  website: string;
  address: string;
  notes: string;
  status: PartnerStatus;
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

export function partnerCategoryLabel(category: string): string {
  if (isPartnerCategory(category)) return PARTNER_CATEGORY_LABELS[category];
  return category;
}
