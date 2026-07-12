import type {
  Asset,
  AssetDecisionGroup,
  AssetListFilters,
  AssetStatus,
  AssetWriteInput,
  PurchaseWriteInput,
  RepairWriteInput,
  AssetPurchaseRecord,
  AssetRepairRecord,
} from "../types/asset";

export interface AssetRepository {
  listByWorkspace(
    workspaceId: string,
    filters?: AssetListFilters
  ): Promise<Asset[]>;
  getById(id: string, workspaceId: string): Promise<Asset | null>;
  create(workspaceId: string, input: AssetWriteInput): Promise<Asset>;
  update(
    id: string,
    workspaceId: string,
    input: AssetWriteInput
  ): Promise<Asset>;
  archive(id: string, workspaceId: string): Promise<void>;
  /** Restore archived row — uses existing is_archived column (no schema change) */
  unarchive(id: string, workspaceId: string): Promise<void>;
  updateStatus(
    id: string,
    workspaceId: string,
    status: AssetStatus
  ): Promise<Asset>;
  addPurchase(
    assetId: string,
    workspaceId: string,
    input: PurchaseWriteInput
  ): Promise<AssetPurchaseRecord>;
  listPurchases(
    assetId: string,
    workspaceId: string
  ): Promise<AssetPurchaseRecord[]>;
  addRepair(
    assetId: string,
    workspaceId: string,
    input: RepairWriteInput
  ): Promise<AssetRepairRecord>;
  listRepairs(
    assetId: string,
    workspaceId: string
  ): Promise<AssetRepairRecord[]>;
  listDecisionGroups(workspaceId: string): Promise<AssetDecisionGroup[]>;
}
