import type { Asset } from "../types/asset";
import type { AssetDecisionGroup } from "../types/asset";
import type { BudgetItem } from "../types/budget";

export interface BudgetRepository {
  listByWorkspace(workspaceId: string): Promise<BudgetItem[]>;
  getByAssetId(
    workspaceId: string,
    assetId: string
  ): Promise<BudgetItem | null>;
  update(
    id: string,
    workspaceId: string,
    patch: Partial<BudgetItem>
  ): Promise<BudgetItem>;
  listDecisionGroups(workspaceId: string): Promise<AssetDecisionGroup[]>;
  /** Soft sync: update linked budget line amounts from asset */
  updateFromAsset(workspaceId: string, asset: Asset): Promise<void>;
}
