/**
 * Domain: Budget
 */

export type BudgetPriority = "must" | "should" | "nice";

export type BudgetStatus =
  | "no_price"
  | "comparing"
  | "ready_to_buy"
  | "purchased"
  | "awaiting_delivery"
  | "received"
  | "installed";

export type BudgetItem = {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  priority: BudgetPriority;
  status: BudgetStatus;
  plannedAmount: number | null;
  actualAmount: number | null;
  assetId: string | null;
  decisionGroupId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
  /** UI aliases */
  estimatedPrice?: number | null;
  actualPrice?: number | null;
  quantity?: number;
};

export type BudgetSummary = {
  readyPercent: number;
  mustReady: number;
  mustTotal: number;
  shouldReady: number;
  shouldTotal: number;
  niceReady: number;
  niceTotal: number;
  moneyNeededAll: number;
  moneyNeededMust: number;
  unknownPriceAll: number;
  unknownPriceMust: number;
  minimumBudget: number;
  maximumBudget: number;
  uncertainBudget: number;
  decisionHints: string[];
};
