import type {
  AssetDecisionGroup,
  AssetItem,
  AssetPriority,
  AssetPurchaseChannel,
  AssetPurchaseRecord,
  AssetRepairRecord,
  AssetStatus,
  BudgetItem,
  BudgetPriority,
  BudgetStatus,
} from "../../data/seed/tangtao";
import type {
  BiAssetDecisionGroupRow,
  BiAssetPurchaseRow,
  BiAssetRepairRow,
  BiAssetRow,
  BiBudgetItemRow,
  BiWorkspaceRow,
  Json,
} from "./database.types";

export const BI_WORKSPACE_ID = "11111111-1111-1111-1111-111111111111";
export const BI_WORKSPACE_SLUG = "tangtao";
export const BI_POS_GROUP_ID = "22222222-2222-2222-2222-222222222201";


export type WorkspaceModel = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type Specs = {
  size?: string;
  color?: string;
  material?: string;
  power?: string;
  specs?: string;
  requiredForOpening?: boolean;
};

function asSpecs(raw: Json | null | undefined): Specs {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Specs;
}

export function rowToWorkspace(row: BiWorkspaceRow): WorkspaceModel {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
  };
}

export function rowToPurchase(row: BiAssetPurchaseRow): AssetPurchaseRecord {
  return {
    id: row.id,
    assetId: row.asset_id,
    purchasedAt: row.purchase_date ?? row.created_at.slice(0, 10),
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    total: Number(row.total_price),
    supplier: row.supplier_name ?? "",
    recordedBy: "",
    status: (row.status as AssetStatus) || "ordered",
    note: row.notes ?? "",
  };
}

export function rowToRepair(row: BiAssetRepairRow): AssetRepairRecord {
  return {
    id: row.id,
    assetId: row.asset_id,
    reportedAt: row.reported_at,
    symptom: row.problem,
    repairer: row.repair_provider ?? "",
    cost: row.repair_cost == null ? null : Number(row.repair_cost),
    returnedAt: row.returned_at,
    result: row.result ?? "",
    note: row.notes ?? "",
  };
}

export function rowToAssetItem(
  row: BiAssetRow,
  purchases: BiAssetPurchaseRow[] = [],
  repairs: BiAssetRepairRow[] = []
): AssetItem {
  const specs = asSpecs(row.specifications);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand ?? "",
    model: row.model ?? "",
    quantity: Number(row.quantity) || 1,
    unit: row.unit,
    estimatedPrice:
      row.estimated_unit_price == null
        ? null
        : Number(row.estimated_unit_price),
    actualPrice:
      row.actual_unit_price == null ? null : Number(row.actual_unit_price),
    supplier: row.supplier_name ?? "",
    purchaseChannel: (row.purchase_channel ?? "") as AssetPurchaseChannel,
    purchaseUrl: row.purchase_url ?? "",
    priority: (row.priority as AssetPriority) || "must",
    status: (row.status as AssetStatus) || "planned",
    requiredForOpening: specs.requiredForOpening !== false,
    purchasedAt: row.purchase_date,
    size: specs.size ?? "",
    color: specs.color ?? "",
    material: specs.material ?? "",
    power: specs.power ?? "",
    specs: specs.specs ?? "",
    note: row.notes ?? "",
    warranty:
      row.warranty_months != null ? `${row.warranty_months} เดือน` : "",
    warrantyUntil: row.warranty_expires_at,
    serialNumber: row.serial_number ?? "",
    imageUrl: null,
    documentIds: [],
    decisionGroupId: row.decision_group_id,
    purchaseHistory: purchases.map(rowToPurchase),
    repairHistory: repairs.map(rowToRepair),
  };
}

export function assetToRow(
  asset: Omit<AssetItem, "id"> | AssetItem,
  workspaceId: string,
  id?: string
) {
  const warrantyMonths = parseWarrantyMonths(asset.warranty);
  return {
    ...(id ? { id } : {}),
    workspace_id: workspaceId,
    name: asset.name,
    category: asset.category,
    brand: asset.brand || null,
    model: asset.model || null,
    quantity: asset.quantity,
    unit: asset.unit,
    estimated_unit_price: asset.estimatedPrice,
    actual_unit_price: asset.actualPrice,
    supplier_name: asset.supplier || null,
    purchase_channel: asset.purchaseChannel || null,
    purchase_url: asset.purchaseUrl || null,
    priority: asset.priority,
    status: asset.status,
    purchase_date: asset.purchasedAt,
    specifications: {
      size: asset.size,
      color: asset.color,
      material: asset.material,
      power: asset.power,
      specs: asset.specs,
      requiredForOpening: asset.requiredForOpening,
    },
    notes: asset.note || null,
    warranty_months: warrantyMonths,
    warranty_expires_at: asset.warrantyUntil,
    serial_number: asset.serialNumber || null,
    decision_group_id: asset.decisionGroupId,
    is_archived: false,
  };
}

export function rowToBudgetItem(row: BiBudgetItemRow): BudgetItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category ?? "",
    priority: (row.priority as BudgetPriority) || "must",
    status: (row.status as BudgetStatus) || "no_price",
    estimatedPrice:
      row.planned_amount == null ? null : Number(row.planned_amount),
    actualPrice:
      row.actual_amount == null ? null : Number(row.actual_amount),
    quantity: 1,
    assetId: row.asset_id,
    decisionGroupId: row.decision_group_id,
  };
}

export function budgetItemToRow(
  item: BudgetItem,
  workspaceId: string
): Partial<BiBudgetItemRow> & { workspace_id: string; name: string } {
  return {
    id: item.id,
    workspace_id: workspaceId,
    name: item.name,
    category: item.category || null,
    planned_amount: item.estimatedPrice,
    actual_amount: item.actualPrice,
    priority: item.priority,
    status: item.status,
    asset_id: item.assetId ?? null,
    decision_group_id: item.decisionGroupId ?? null,
  };
}

export function buildDecisionGroups(
  groups: BiAssetDecisionGroupRow[],
  assets: AssetItem[]
): AssetDecisionGroup[] {
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    assetIds: assets
      .filter((a) => a.decisionGroupId === g.id)
      .map((a) => a.id),
    selectedId: g.selected_asset_id,
  }));
}

function parseWarrantyMonths(warranty: string): number | null {
  const m = warranty.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}
