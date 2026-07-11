import type { BiSupabaseClient } from "../supabase/client";
import { configError, normalizeError, notFoundError } from "../supabase/errors";
import {
  assetFromDatabase,
  assetToDatabase,
  decisionGroupFromDatabase,
  purchaseFromDatabase,
  purchaseToDatabase,
  repairFromDatabase,
  repairToDatabase,
  type AssetRow,
  type DecisionGroupRow,
  type PurchaseRow,
  type RepairRow,
} from "../mappers/assetMapper";
import type {
  AssetDecisionGroup,
  AssetStatus,
} from "../types/asset";
import type { AssetRepository } from "./assetRepository";

async function loadRelated(
  client: BiSupabaseClient,
  assetIds: string[]
): Promise<{ purchases: PurchaseRow[]; repairs: RepairRow[] }> {
  if (assetIds.length === 0) return { purchases: [], repairs: [] };
  const [{ data: purchases }, { data: repairs }] = await Promise.all([
    client.from("bi_asset_purchases").select("*").in("asset_id", assetIds),
    client.from("bi_asset_repairs").select("*").in("asset_id", assetIds),
  ]);
  return {
    purchases: (purchases ?? []) as PurchaseRow[],
    repairs: (repairs ?? []) as RepairRow[],
  };
}

export function createSupabaseAssetRepository(
  client: BiSupabaseClient | null
): AssetRepository {
  function requireClient(): BiSupabaseClient {
    if (!client) throw configError();
    return client;
  }

  return {
    async listByWorkspace(workspaceId, filters) {
      try {
        let query = requireClient()
          .from("bi_assets")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false });

        if (!filters?.includeArchived) {
          query = query.eq("is_archived", false);
        }
        if (filters?.status) query = query.eq("status", filters.status);
        if (filters?.category) query = query.eq("category", filters.category);
        if (filters?.decisionGroupId) {
          query = query.eq("decision_group_id", filters.decisionGroupId);
        }

        const { data, error } = await query;
        if (error) throw error;
        const rows = (data ?? []) as AssetRow[];
        const { purchases, repairs } = await loadRelated(
          requireClient(),
          rows.map((r) => r.id)
        );
        return rows.map((row) =>
          assetFromDatabase(
            row,
            purchases.filter((p) => p.asset_id === row.id),
            repairs.filter((r) => r.asset_id === row.id)
          )
        );
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async getById(id, workspaceId) {
      try {
        const { data, error } = await requireClient()
          .from("bi_assets")
          .select("*")
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .maybeSingle();
        if (error) throw error;
        if (!data) return null;
        const row = data as AssetRow;
        const { purchases, repairs } = await loadRelated(requireClient(), [
          row.id,
        ]);
        return assetFromDatabase(row, purchases, repairs);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async create(workspaceId, input) {
      try {
        const payload = assetToDatabase(input, workspaceId);
        const { data, error } = await requireClient()
          .from("bi_assets")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;
        return assetFromDatabase(data as AssetRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async update(id, workspaceId, input) {
      try {
        const payload = assetToDatabase(input, workspaceId, id);
        const { data, error } = await requireClient()
          .from("bi_assets")
          .update(payload)
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .select("*")
          .single();
        if (error) throw error;
        const { purchases, repairs } = await loadRelated(requireClient(), [id]);
        return assetFromDatabase(data as AssetRow, purchases, repairs);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async archive(id, workspaceId) {
      try {
        const { error } = await requireClient()
          .from("bi_assets")
          .update({ is_archived: true })
          .eq("id", id)
          .eq("workspace_id", workspaceId);
        if (error) throw error;
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async updateStatus(id, workspaceId, status) {
      try {
        const { data, error } = await requireClient()
          .from("bi_assets")
          .update({ status })
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .select("*")
          .single();
        if (error) throw error;
        const { purchases, repairs } = await loadRelated(requireClient(), [id]);
        return assetFromDatabase(data as AssetRow, purchases, repairs);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async addPurchase(assetId, workspaceId, input) {
      try {
        const payload = purchaseToDatabase(input, workspaceId, assetId);
        const { data, error } = await requireClient()
          .from("bi_asset_purchases")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;

        const asset = await this.getById(assetId, workspaceId);
        if (!asset) throw notFoundError("อุปกรณ์");

        await requireClient()
          .from("bi_assets")
          .update({
            quantity: asset.quantity + input.quantity,
            actual_unit_price: input.unitPrice,
            purchase_date: input.purchaseDate,
            status: input.status ?? asset.status,
            supplier_name: (input.supplierName ?? asset.supplierName) || null,
          })
          .eq("id", assetId)
          .eq("workspace_id", workspaceId);

        return purchaseFromDatabase(data as PurchaseRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async listPurchases(assetId, workspaceId) {
      try {
        const { data, error } = await requireClient()
          .from("bi_asset_purchases")
          .select("*")
          .eq("asset_id", assetId)
          .eq("workspace_id", workspaceId)
          .order("purchase_date", { ascending: false });
        if (error) throw error;
        return ((data ?? []) as PurchaseRow[]).map(purchaseFromDatabase);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async addRepair(assetId, workspaceId, input) {
      try {
        const payload = repairToDatabase(input, workspaceId, assetId);
        const { data, error } = await requireClient()
          .from("bi_asset_repairs")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;

        await requireClient()
          .from("bi_assets")
          .update({ status: "repairing" satisfies AssetStatus })
          .eq("id", assetId)
          .eq("workspace_id", workspaceId);

        return repairFromDatabase(data as RepairRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async listRepairs(assetId, workspaceId) {
      try {
        const { data, error } = await requireClient()
          .from("bi_asset_repairs")
          .select("*")
          .eq("asset_id", assetId)
          .eq("workspace_id", workspaceId)
          .order("reported_at", { ascending: false });
        if (error) throw error;
        return ((data ?? []) as RepairRow[]).map(repairFromDatabase);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async listDecisionGroups(workspaceId): Promise<AssetDecisionGroup[]> {
      try {
        const c = requireClient();
        const [{ data: groups, error }, assets] = await Promise.all([
          c
            .from("bi_asset_decision_groups")
            .select("*")
            .eq("workspace_id", workspaceId),
          this.listByWorkspace(workspaceId),
        ]);
        if (error) throw error;
        return ((groups ?? []) as DecisionGroupRow[]).map((g) =>
          decisionGroupFromDatabase(
            g,
            assets.filter((a) => a.decisionGroupId === g.id).map((a) => a.id)
          )
        );
      } catch (e) {
        throw normalizeError(e);
      }
    },
  };
}
