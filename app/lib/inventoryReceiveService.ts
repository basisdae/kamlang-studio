/**
 * Receive purchased ingredients into inventory.
 *
 * Converts purchase quantities to inventory stock units,
 * updates SavedInventoryRepository, and marks purchase lines received.
 */
import { getIngredientById } from "../ingredients/IngredientRepository";
import type { IngredientUnit } from "../ingredients/types";
import { getEffectiveInventoryByIngredientId } from "../inventory/inventoryAccess";
import type { PurchaseListLine } from "../purchase/types";
import { purchaseLineKey } from "../purchase/utils";
import {
  getSavedInventoryAdjustment,
  upsertInventoryAdjustment,
} from "../repositories/SavedInventoryRepository";
import { updatePurchaseLineState } from "../repositories/SavedPurchaseRepository";
import { addActivity } from "../repositories/ActivityLogRepository";

export type PurchaseReceiveLineInput = {
  lineKey: string;
  ingredientId: string;
  receivedQuantity: number;
};

export function convertQuantityToStockUnit(
  stockUnit: IngredientUnit,
  fromUnit: string,
  quantity: number
): number {
  if (fromUnit === stockUnit) {
    return quantity;
  }

  if (stockUnit === "kg" && fromUnit === "g") {
    return quantity / 1000;
  }

  if (stockUnit === "liter" && fromUnit === "ml") {
    return quantity / 1000;
  }

  if (stockUnit === "g" && fromUnit === "kg") {
    return quantity * 1000;
  }

  if (stockUnit === "ml" && fromUnit === "liter") {
    return quantity * 1000;
  }

  return quantity;
}

export function getDefaultReceiveQuantity(line: PurchaseListLine): number {
  const inventory = getEffectiveInventoryByIngredientId(line.ingredientId);

  if (!inventory) {
    return line.quantityNeeded;
  }

  return convertQuantityToStockUnit(
    inventory.unit,
    line.unit,
    line.quantityNeeded
  );
}

export function getReceiveStockUnit(ingredientId: string): IngredientUnit | null {
  const inventory = getEffectiveInventoryByIngredientId(ingredientId);
  return inventory?.unit ?? getIngredientById(ingredientId)?.stockUnit ?? null;
}

export function applyPurchaseReceive(
  planDate: string,
  planId: string,
  lines: PurchaseReceiveLineInput[]
): void {
  const now = new Date().toISOString();

  for (const line of lines) {
    if (line.receivedQuantity <= 0) continue;

    const inventory = getEffectiveInventoryByIngredientId(line.ingredientId);
    if (!inventory) continue;

    const existingAdjustment = getSavedInventoryAdjustment(line.ingredientId);
    const nextStock = inventory.stockQuantity + line.receivedQuantity;

    upsertInventoryAdjustment({
      ingredientId: line.ingredientId,
      stockQuantity: nextStock,
      minQuantity: existingAdjustment?.minQuantity ?? inventory.minQuantity,
      note: existingAdjustment?.note,
      updatedAt: now,
    }, { recordVersion: false });

    updatePurchaseLineState(planDate, planId, line.lineKey, {
      isReceived: true,
      receivedAt: now,
      receivedQuantity: line.receivedQuantity,
    });
  }

  const receivedCount = lines.filter((line) => line.receivedQuantity > 0).length;

  if (receivedCount > 0) {
    addActivity({
      type: "purchase_received",
      message: `เอาเข้าครัวจากซื้อของ ${receivedCount} รายการ`,
      entityType: "purchase",
      entityId: planId,
    });
  }
}

export function buildReceiveLineKey(line: PurchaseListLine): string {
  return purchaseLineKey(line.ingredientId, line.unit);
}
