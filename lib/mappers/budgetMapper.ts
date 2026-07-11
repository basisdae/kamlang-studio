import type { BudgetItem, BudgetPriority, BudgetStatus } from "../types/budget";

export type BudgetItemRow = {
  id: string;
  workspace_id: string;
  asset_id: string | null;
  decision_group_id: string | null;
  name: string;
  category: string | null;
  planned_amount: number | string | null;
  actual_amount: number | string | null;
  priority: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function budgetItemFromDatabase(row: BudgetItemRow): BudgetItem {
  const planned = asNumber(row.planned_amount);
  const actual = asNumber(row.actual_amount);
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    category: row.category ?? "",
    priority: (row.priority as BudgetPriority) || "must",
    status: (row.status as BudgetStatus) || "no_price",
    plannedAmount: planned,
    actualAmount: actual,
    assetId: row.asset_id,
    decisionGroupId: row.decision_group_id,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    estimatedPrice: planned,
    actualPrice: actual,
    quantity: 1,
  };
}

export function budgetItemToDatabase(
  item: Partial<BudgetItem> & { name: string },
  workspaceId: string,
  id?: string
): Record<string, unknown> {
  return {
    ...(id ? { id } : {}),
    workspace_id: workspaceId,
    name: item.name,
    category: item.category ?? null,
    planned_amount: item.plannedAmount ?? item.estimatedPrice ?? null,
    actual_amount: item.actualAmount ?? item.actualPrice ?? null,
    priority: item.priority ?? "must",
    status: item.status ?? "no_price",
    asset_id: item.assetId ?? null,
    decision_group_id: item.decisionGroupId ?? null,
    notes: item.notes ?? null,
  };
}
