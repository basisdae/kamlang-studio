/**
 * Operations Workspace summary from Shared Core modules already in the app.
 * No invented KPIs — empty counts stay zero / null.
 */

import type { AssetItem } from "../../data/seed/tangtao";
import { getAllIngredients } from "../../app/ingredients/IngredientRepository";
import { getAllInventory } from "../../app/inventory/InventoryRepository";
import { getPurchaseListForDate } from "../../app/lib/purchaseListService";
import { getPurchaseLineStatesForList } from "../../app/repositories/SavedPurchaseRepository";
import { getEffectivePlanByDate } from "../../app/production/planAccess";
import { todayPlanDate } from "../../app/production/utils";
import { purchaseLineKey } from "../../app/purchase/utils";
import { buildProcurementSummary } from "../../app/opening/lib/procurementDomain";

export type OperationsSummary = {
  needBuyCount: number;
  orderedCount: number;
  receivedCount: number;
  ingredientMasterCount: number;
  inventorySkuCount: number;
  todayPurchaseLines: number;
  todayPurchaseBought: number;
  latestPlanLabel: string | null;
  latestPlanStatus: string | null;
  hasTodayPlan: boolean;
};

export function buildOperationsSummary(assets: AssetItem[]): OperationsSummary {
  const procurement = buildProcurementSummary(assets);
  const today = todayPlanDate();
  const plan = getEffectivePlanByDate(today);
  const purchaseList = getPurchaseListForDate(today);

  let todayPurchaseBought = 0;
  let todayPurchaseLines = 0;
  if (purchaseList) {
    todayPurchaseLines = purchaseList.lines.length;
    const keys = purchaseList.lines.map((line) =>
      purchaseLineKey(line.ingredientId, line.unit)
    );
    const states = getPurchaseLineStatesForList(
      purchaseList.planDate,
      purchaseList.planId,
      keys
    );
    todayPurchaseBought = keys.filter((k) => states[k]?.isBought).length;
  }

  return {
    needBuyCount:
      procurement.requestQuote +
      procurement.compare +
      procurement.readyToOrder,
    orderedCount: procurement.outstanding,
    receivedCount: procurement.received,
    ingredientMasterCount: getAllIngredients().length,
    inventorySkuCount: getAllInventory().length,
    todayPurchaseLines,
    todayPurchaseBought,
    latestPlanLabel: plan
      ? `แผนวันนี้ · ${plan.lines.length} เมนู`
      : null,
    latestPlanStatus: plan?.status ?? null,
    hasTodayPlan: Boolean(plan),
  };
}
