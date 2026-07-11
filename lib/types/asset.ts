/**
 * Domain: Assets / equipment
 */

export type AssetPriority = "must" | "should" | "nice";

export type AssetStatus =
  | "planned"
  | "awaiting_quote"
  | "ready_to_buy"
  | "ordered"
  | "awaiting_delivery"
  | "received"
  | "in_use"
  | "repairing"
  | "broken"
  | "retired";

export type AssetPurchaseChannel =
  | "store"
  | "online"
  | "marketplace"
  | "other"
  | "";

export type AssetPurchaseRecord = {
  id: string;
  assetId: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  supplierName: string;
  purchaseChannel: AssetPurchaseChannel;
  purchaseUrl: string;
  status: AssetStatus | "";
  notes: string;
  /** @deprecated alias for UI seed shape */
  purchasedAt?: string;
  supplier?: string;
  recordedBy?: string;
  note?: string;
  total?: number;
  unitPriceLegacy?: number;
};

export type AssetRepairRecord = {
  id: string;
  assetId: string;
  reportedAt: string;
  problem: string;
  repairProvider: string;
  repairCost: number | null;
  returnedAt: string | null;
  result: string;
  notes: string;
  /** UI seed aliases */
  symptom?: string;
  repairer?: string;
  cost?: number | null;
  note?: string;
};

export type AssetDecisionGroup = {
  id: string;
  workspaceId: string;
  name: string;
  selectionMode: "single" | "multi" | string;
  selectedAssetId: string | null;
  notes: string;
  assetIds: string[];
  /** UI alias */
  selectedId?: string | null;
};

/**
 * Canonical Asset domain object used by providers / UI.
 * Field names stay camelCase; mappers bridge DB snake_case.
 */
export type Asset = {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  quantity: number;
  unit: string;
  estimatedUnitPrice: number | null;
  actualUnitPrice: number | null;
  supplierName: string;
  purchaseChannel: AssetPurchaseChannel;
  purchaseUrl: string;
  priority: AssetPriority;
  status: AssetStatus;
  purchaseDate: string | null;
  specifications: {
    size?: string;
    color?: string;
    material?: string;
    power?: string;
    specs?: string;
    requiredForOpening?: boolean;
    [key: string]: unknown;
  };
  notes: string;
  warrantyMonths: number | null;
  warrantyExpiresAt: string | null;
  serialNumber: string;
  decisionGroupId: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  purchaseHistory: AssetPurchaseRecord[];
  repairHistory: AssetRepairRecord[];
  /** UI compatibility fields (mapped from domain) */
  estimatedPrice?: number | null;
  actualPrice?: number | null;
  supplier?: string;
  purchasedAt?: string | null;
  note?: string;
  warranty?: string;
  warrantyUntil?: string | null;
  size?: string;
  color?: string;
  material?: string;
  power?: string;
  specs?: string;
  requiredForOpening?: boolean;
  imageUrl?: string | null;
  documentIds?: string[];
};

/** Input for create/update without server fields */
export type AssetWriteInput = {
  name: string;
  category: string;
  brand?: string;
  model?: string;
  quantity?: number;
  unit?: string;
  estimatedUnitPrice?: number | null;
  actualUnitPrice?: number | null;
  supplierName?: string;
  purchaseChannel?: AssetPurchaseChannel;
  purchaseUrl?: string;
  priority?: AssetPriority;
  status?: AssetStatus;
  purchaseDate?: string | null;
  specifications?: Asset["specifications"];
  notes?: string;
  warrantyMonths?: number | null;
  warrantyExpiresAt?: string | null;
  serialNumber?: string;
  decisionGroupId?: string | null;
};

export type AssetListFilters = {
  includeArchived?: boolean;
  status?: AssetStatus;
  category?: string;
  decisionGroupId?: string;
};

export type PurchaseWriteInput = {
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  purchaseDate: string;
  supplierName?: string;
  purchaseChannel?: AssetPurchaseChannel;
  purchaseUrl?: string;
  status?: AssetStatus;
  notes?: string;
};

export type RepairWriteInput = {
  reportedAt: string;
  problem: string;
  repairProvider?: string;
  repairCost?: number | null;
  returnedAt?: string | null;
  result?: string;
  notes?: string;
};
