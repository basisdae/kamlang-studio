import type { ProductionLine, ProductionPlan } from "../types";

/**
 * Builder workspace types for saved production plans.
 *
 * Not the same as read-only seed plans (ProductionRepository).
 */
export type SavedProductionPlan = ProductionPlan & {
  createdAt: string;
  updatedAt: string;
};

export type ProductionLineDraft = {
  key: string;
  menuId: string;
  quantity: string;
  note: string;
};

export type ProductionBuilderValidationErrors = {
  date?: string;
  lines?: string;
  lineMenuIds?: Record<string, string>;
  lineQuantities?: Record<string, string>;
};
