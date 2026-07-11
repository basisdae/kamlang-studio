import type { BiSupabaseClient } from "../supabase/client";
import { configError, normalizeError } from "../supabase/errors";
import {
  decisionGroupFromDatabase,
  type DecisionGroupRow,
} from "../mappers/assetMapper";
import {
  budgetItemFromDatabase,
  budgetItemToDatabase,
  type BudgetItemRow,
} from "../mappers/budgetMapper";
import type { Asset, AssetDecisionGroup } from "../types/asset";
import type { BudgetRepository } from "./budgetRepository";

export function createSupabaseBudgetRepository(
  client: BiSupabaseClient | null
): BudgetRepository {
  function requireClient(): BiSupabaseClient {
    if (!client) throw configError();
    return client;
  }

  return {
    async listByWorkspace(workspaceId) {
      try {
        const { data, error } = await requireClient()
          .from("bi_budget_items")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("updated_at", { ascending: false });
        if (error) throw error;
        return ((data ?? []) as BudgetItemRow[]).map(budgetItemFromDatabase);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async getByAssetId(workspaceId, assetId) {
      try {
        const { data, error } = await requireClient()
          .from("bi_budget_items")
          .select("*")
          .eq("workspace_id", workspaceId)
          .eq("asset_id", assetId)
          .maybeSingle();
        if (error) throw error;
        return data ? budgetItemFromDatabase(data as BudgetItemRow) : null;
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async update(id, workspaceId, patch) {
      try {
        const payload = budgetItemToDatabase(
          {
            name: patch.name ?? "",
            ...patch,
          },
          workspaceId,
          id
        );
        // Avoid overwriting name with empty when patching amounts only
        if (!patch.name) delete payload.name;

        const { data, error } = await requireClient()
          .from("bi_budget_items")
          .update(payload)
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .select("*")
          .single();
        if (error) throw error;
        return budgetItemFromDatabase(data as BudgetItemRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async listDecisionGroups(workspaceId): Promise<AssetDecisionGroup[]> {
      try {
        const [{ data: groups, error }, { data: assets }] = await Promise.all([
          requireClient()
            .from("bi_asset_decision_groups")
            .select("*")
            .eq("workspace_id", workspaceId),
          requireClient()
            .from("bi_assets")
            .select("id, decision_group_id")
            .eq("workspace_id", workspaceId)
            .eq("is_archived", false),
        ]);
        if (error) throw error;
        const assetRows = (assets ?? []) as {
          id: string;
          decision_group_id: string | null;
        }[];
        return ((groups ?? []) as DecisionGroupRow[]).map((g) =>
          decisionGroupFromDatabase(
            g,
            assetRows
              .filter((a) => a.decision_group_id === g.id)
              .map((a) => a.id)
          )
        );
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async updateFromAsset(workspaceId, asset: Asset) {
      try {
        const linked = await this.getByAssetId(workspaceId, asset.id);
        if (!linked) return;
        const planned =
          asset.estimatedUnitPrice ?? linked.plannedAmount ?? null;
        const actual = asset.actualUnitPrice ?? linked.actualAmount ?? null;
        await this.update(linked.id, workspaceId, {
          name: linked.name,
          plannedAmount: planned,
          actualAmount: actual,
          estimatedPrice: planned,
          actualPrice: actual,
        });
      } catch (e) {
        throw normalizeError(e);
      }
    },
  };
}
