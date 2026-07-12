import type {
  Asset,
  AssetDecisionGroup,
  AssetPurchaseChannel,
  AssetPurchaseRecord,
  AssetRepairRecord,
  AssetStatus,
  AssetWriteInput,
  PurchaseWriteInput,
  RepairWriteInput,
} from "../types/asset";

function asNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function asRequiredNumber(value: unknown, fallback = 0): number {
  return asNumber(value) ?? fallback;
}

function asString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

function asSpecs(raw: unknown): Asset["specifications"] {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Asset["specifications"];
}

export type AssetRow = {
  id: string;
  workspace_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  quantity: number | string;
  unit: string;
  estimated_unit_price: number | string | null;
  actual_unit_price: number | string | null;
  supplier_name: string | null;
  purchase_channel: string | null;
  purchase_url: string | null;
  priority: string;
  status: string;
  purchase_date: string | null;
  specifications: unknown;
  notes: string | null;
  warranty_months: number | string | null;
  warranty_expires_at: string | null;
  serial_number: string | null;
  decision_group_id: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
};

export type PurchaseRow = {
  id: string;
  workspace_id: string;
  asset_id: string;
  quantity: number | string;
  unit_price: number | string;
  total_price: number | string;
  supplier_name: string | null;
  purchase_channel: string | null;
  purchase_url: string | null;
  purchase_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type RepairRow = {
  id: string;
  workspace_id: string;
  asset_id: string;
  reported_at: string;
  problem: string;
  repair_provider: string | null;
  repair_cost: number | string | null;
  returned_at: string | null;
  result: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type DecisionGroupRow = {
  id: string;
  workspace_id: string;
  name: string;
  selection_mode: string;
  selected_asset_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export function purchaseFromDatabase(row: PurchaseRow): AssetPurchaseRecord {
  const purchaseDate =
    row.purchase_date ?? row.created_at.slice(0, 10);
  const unitPrice = asRequiredNumber(row.unit_price);
  const totalPrice = asRequiredNumber(row.total_price);
  return {
    id: row.id,
    assetId: row.asset_id,
    purchaseDate,
    quantity: asRequiredNumber(row.quantity, 1),
    unitPrice,
    totalPrice,
    supplierName: asString(row.supplier_name),
    purchaseChannel: (row.purchase_channel ?? "") as AssetPurchaseChannel,
    purchaseUrl: asString(row.purchase_url),
    status: (row.status ?? "") as AssetStatus | "",
    notes: asString(row.notes),
    purchasedAt: purchaseDate,
    supplier: asString(row.supplier_name),
    recordedBy: "",
    note: asString(row.notes),
    total: totalPrice,
  };
}

export function repairFromDatabase(row: RepairRow): AssetRepairRecord {
  const cost = asNumber(row.repair_cost);
  return {
    id: row.id,
    assetId: row.asset_id,
    reportedAt: row.reported_at,
    problem: row.problem,
    repairProvider: asString(row.repair_provider),
    repairCost: cost,
    returnedAt: row.returned_at,
    result: asString(row.result),
    notes: asString(row.notes),
    symptom: row.problem,
    repairer: asString(row.repair_provider),
    cost,
    note: asString(row.notes),
  };
}

export function assetFromDatabase(
  row: AssetRow,
  purchases: PurchaseRow[] = [],
  repairs: RepairRow[] = []
): Asset {
  const specs = asSpecs(row.specifications);
  const estimated = asNumber(row.estimated_unit_price);
  const actual = asNumber(row.actual_unit_price);
  const warrantyMonths = asNumber(row.warranty_months);

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    category: row.category,
    brand: asString(row.brand),
    model: asString(row.model),
    quantity: asRequiredNumber(row.quantity, 1),
    unit: row.unit || "ชิ้น",
    estimatedUnitPrice: estimated,
    actualUnitPrice: actual,
    supplierName: asString(row.supplier_name),
    purchaseChannel: (row.purchase_channel ?? "") as AssetPurchaseChannel,
    purchaseUrl: asString(row.purchase_url),
    priority: (row.priority as Asset["priority"]) || "must",
    status: (row.status as AssetStatus) || "planned",
    purchaseDate: row.purchase_date,
    specifications: specs,
    notes: asString(row.notes),
    warrantyMonths,
    warrantyExpiresAt: row.warranty_expires_at,
    serialNumber: asString(row.serial_number),
    decisionGroupId: row.decision_group_id,
    isArchived: Boolean(row.is_archived),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    purchaseHistory: purchases.map(purchaseFromDatabase),
    repairHistory: repairs.map(repairFromDatabase),
    estimatedPrice: estimated,
    actualPrice: actual,
    supplier: asString(row.supplier_name),
    purchasedAt: row.purchase_date,
    note: asString(row.notes),
    warranty:
      warrantyMonths != null ? `${warrantyMonths} เดือน` : "",
    warrantyUntil: row.warranty_expires_at,
    size: asString(specs.size),
    color: asString(specs.color),
    material: asString(specs.material),
    power: asString(specs.power),
    specs: asString(specs.specs),
    requiredForOpening: specs.requiredForOpening !== false,
    imageUrl: null,
    documentIds: [],
  };
}

export function assetToDatabase(
  input: AssetWriteInput,
  workspaceId: string,
  id?: string
): Record<string, unknown> {
  const specs = input.specifications ?? {};
  return {
    ...(id ? { id } : {}),
    workspace_id: workspaceId,
    name: input.name.trim(),
    category: input.category,
    brand: input.brand?.trim() || null,
    model: input.model?.trim() || null,
    quantity: input.quantity ?? 1,
    unit: input.unit ?? "ชิ้น",
    estimated_unit_price: input.estimatedUnitPrice ?? null,
    actual_unit_price: input.actualUnitPrice ?? null,
    supplier_name: input.supplierName?.trim() || null,
    purchase_channel: input.purchaseChannel || null,
    purchase_url: input.purchaseUrl?.trim() || null,
    priority: input.priority ?? "must",
    status: input.status ?? "planned",
    purchase_date: input.purchaseDate ?? null,
    specifications: specs,
    notes: input.notes?.trim() || null,
    warranty_months: input.warrantyMonths ?? null,
    warranty_expires_at: input.warrantyExpiresAt ?? null,
    serial_number: input.serialNumber?.trim() || null,
    decision_group_id: input.decisionGroupId ?? null,
    is_archived: false,
  };
}

export function purchaseToDatabase(
  input: PurchaseWriteInput,
  workspaceId: string,
  assetId: string
): Record<string, unknown> {
  const quantity = input.quantity;
  const unitPrice = input.unitPrice;
  const totalPrice = input.totalPrice ?? quantity * unitPrice;
  return {
    workspace_id: workspaceId,
    asset_id: assetId,
    quantity,
    unit_price: unitPrice,
    total_price: totalPrice,
    supplier_name: input.supplierName?.trim() || null,
    purchase_channel: input.purchaseChannel || null,
    purchase_url: input.purchaseUrl?.trim() || null,
    purchase_date: input.purchaseDate,
    status: input.status ?? null,
    notes: input.notes?.trim() || null,
  };
}

export function repairToDatabase(
  input: RepairWriteInput,
  workspaceId: string,
  assetId: string
): Record<string, unknown> {
  return {
    workspace_id: workspaceId,
    asset_id: assetId,
    reported_at: input.reportedAt,
    problem: input.problem.trim(),
    repair_provider: input.repairProvider?.trim() || null,
    repair_cost: input.repairCost ?? null,
    returned_at: input.returnedAt ?? null,
    result: input.result?.trim() || null,
    notes: input.notes?.trim() || null,
  };
}

export function decisionGroupFromDatabase(
  row: DecisionGroupRow,
  assetIds: string[] = []
): AssetDecisionGroup {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    selectionMode: row.selection_mode,
    selectedAssetId: row.selected_asset_id,
    notes: asString(row.notes),
    assetIds,
    selectedId: row.selected_asset_id,
  };
}

/** Map UI AssetItem-like patch into write input */
export function uiAssetToWriteInput(
  item: Record<string, unknown>
): AssetWriteInput {
  const warranty = asString(item.warranty);
  const warrantyMatch = warranty.match(/(\d+)/);
  const prevSpecs =
    item.specifications && typeof item.specifications === "object"
      ? { ...(item.specifications as Record<string, unknown>) }
      : {};
  if (item.procurement !== undefined) {
    prevSpecs.procurement = item.procurement;
  }
  return {
    name: asString(item.name),
    category: asString(item.category),
    brand: asString(item.brand),
    model: asString(item.model),
    quantity: asRequiredNumber(item.quantity, 1),
    unit: asString(item.unit, "ชิ้น"),
    estimatedUnitPrice: asNumber(
      item.estimatedUnitPrice ?? item.estimatedPrice
    ),
    actualUnitPrice: asNumber(item.actualUnitPrice ?? item.actualPrice),
    supplierName: asString(item.supplierName ?? item.supplier),
    purchaseChannel: (asString(
      item.purchaseChannel
    ) || "") as AssetPurchaseChannel,
    purchaseUrl: asString(item.purchaseUrl),
    priority: (asString(item.priority, "must") as Asset["priority"]) || "must",
    status: (asString(item.status, "planned") as AssetStatus) || "planned",
    purchaseDate: (item.purchaseDate ?? item.purchasedAt ?? null) as
      | string
      | null,
    specifications: {
      ...prevSpecs,
      size: asString(item.size ?? prevSpecs.size),
      color: asString(item.color ?? prevSpecs.color),
      material: asString(item.material ?? prevSpecs.material),
      power: asString(item.power ?? prevSpecs.power),
      specs: asString(item.specs ?? prevSpecs.specs),
      requiredForOpening:
        item.requiredForOpening === undefined
          ? prevSpecs.requiredForOpening === undefined
            ? true
            : Boolean(prevSpecs.requiredForOpening)
          : Boolean(item.requiredForOpening),
    },
    notes: asString(item.notes ?? item.note),
    warrantyMonths: warrantyMatch
      ? Number(warrantyMatch[1])
      : asNumber(item.warrantyMonths),
    warrantyExpiresAt: (item.warrantyExpiresAt ??
      item.warrantyUntil ??
      null) as string | null,
    serialNumber: asString(item.serialNumber),
    decisionGroupId: (item.decisionGroupId ?? null) as string | null,
  };
}
