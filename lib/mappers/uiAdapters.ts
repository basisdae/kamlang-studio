import type { AssetItem, AssetDecisionGroup as UiDecisionGroup, AssetPurchaseRecord as UiPurchase, AssetRepairRecord as UiRepair } from "../../data/seed/tangtao";
import type { Asset, AssetDecisionGroup } from "../types/asset";
import type { BudgetItem as DomainBudget } from "../types/budget";
import type { BudgetItem as UiBudget } from "../../data/seed/tangtao";
import { parseProcurementMeta } from "../types/procurement";

export function assetToUiItem(asset: Asset): AssetItem {
  const purchases: UiPurchase[] = asset.purchaseHistory.map((p) => ({
    id: p.id,
    assetId: p.assetId,
    purchasedAt: p.purchaseDate,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
    total: p.totalPrice,
    supplier: p.supplierName,
    recordedBy: p.recordedBy ?? "",
    status: (p.status || "ordered") as UiPurchase["status"],
    note: p.notes,
  }));

  const repairs: UiRepair[] = asset.repairHistory.map((r) => ({
    id: r.id,
    assetId: r.assetId,
    reportedAt: r.reportedAt,
    symptom: r.problem,
    repairer: r.repairProvider,
    cost: r.repairCost,
    returnedAt: r.returnedAt,
    result: r.result,
    note: r.notes,
  }));

  return {
    id: asset.id,
    name: asset.name,
    category: asset.category,
    brand: asset.brand,
    model: asset.model,
    quantity: asset.quantity,
    unit: asset.unit,
    estimatedPrice: asset.estimatedUnitPrice,
    actualPrice: asset.actualUnitPrice,
    supplier: asset.supplierName,
    purchaseChannel: asset.purchaseChannel,
    purchaseUrl: asset.purchaseUrl,
    priority: asset.priority,
    status: asset.status,
    requiredForOpening: asset.specifications.requiredForOpening !== false,
    purchasedAt: asset.purchaseDate,
    size: asset.specifications.size ?? "",
    color: asset.specifications.color ?? "",
    material: asset.specifications.material ?? "",
    power: asset.specifications.power ?? "",
    specs: asset.specifications.specs ?? "",
    note: asset.notes,
    warranty:
      asset.warrantyMonths != null ? `${asset.warrantyMonths} เดือน` : "",
    warrantyUntil: asset.warrantyExpiresAt,
    serialNumber: asset.serialNumber,
    imageUrl: null,
    documentIds: [],
    decisionGroupId: asset.decisionGroupId,
    createdAt: asset.createdAt,
    procurement: parseProcurementMeta(asset.specifications.procurement),
    purchaseHistory: purchases,
    repairHistory: repairs,
  };
}

export function decisionGroupToUi(group: AssetDecisionGroup): UiDecisionGroup {
  return {
    id: group.id,
    name: group.name,
    assetIds: group.assetIds,
    selectedId: group.selectedAssetId ?? group.selectedId ?? null,
  };
}

export function budgetToUi(item: DomainBudget): UiBudget {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    priority: item.priority,
    status: item.status,
    estimatedPrice: item.plannedAmount,
    actualPrice: item.actualAmount,
    quantity: item.quantity ?? 1,
    assetId: item.assetId,
    decisionGroupId: item.decisionGroupId,
  };
}
