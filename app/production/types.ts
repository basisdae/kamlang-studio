/**
 * Production domain types.
 *
 * A Production Plan schedules how many portions of each Menu to prepare.
 * Production references Menu (sellable product), not Recipe directly.
 *
 * @see app/production/README.md
 */
export type ProductionPlanStatus = "draft" | "preparing" | "completed";

export type ProductionLine = {
  menuId: string;
  quantity: number;
  note?: string;
};

export type ProductionPlan = {
  id: string;
  date: string;
  status: ProductionPlanStatus;
  lines: ProductionLine[];
  deducted?: boolean;
  deductedAt?: string;
};

export type ProductionPlanSeed = ProductionPlan;
