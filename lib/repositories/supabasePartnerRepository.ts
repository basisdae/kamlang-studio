import type { BiSupabaseClient } from "../supabase/client";
import { biRuntimeError, configError, normalizeError } from "../supabase/errors";
import {
  partnerFromDatabase,
  partnerPatchToDatabase,
  partnerToDatabase,
  type PartnerRow,
  type PartnerWriteInput,
} from "../mappers/partnerMapper";
import type {
  PartnerListFilters,
  PartnerRepository,
} from "./partnerRepository";

export function createSupabasePartnerRepository(
  client: BiSupabaseClient | null
): PartnerRepository {
  function requireClient(): BiSupabaseClient {
    if (!client) throw configError();
    return client;
  }

  return {
    async listByWorkspace(workspaceId, filters) {
      try {
        let query = requireClient()
          .from("bi_partners")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("name", { ascending: true });

        if (!filters?.includeArchived) {
          query = query.eq("is_archived", false);
        }
        if (filters?.category) query = query.eq("category", filters.category);
        if (filters?.status) query = query.eq("status", filters.status);

        const { data, error } = await query;
        if (error) {
          biRuntimeError("supabasePartnerRepository", "listByWorkspace", error, {
            table: "bi_partners",
            httpStatus: (error as { status?: number }).status ?? error.code,
          });
          throw error;
        }
        return ((data ?? []) as PartnerRow[]).map(partnerFromDatabase);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async getById(id, workspaceId) {
      try {
        const { data, error } = await requireClient()
          .from("bi_partners")
          .select("*")
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .maybeSingle();
        if (error) throw error;
        return data ? partnerFromDatabase(data as PartnerRow) : null;
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async create(workspaceId, input: PartnerWriteInput) {
      try {
        const payload = partnerToDatabase(input, workspaceId);
        const { data, error } = await requireClient()
          .from("bi_partners")
          .insert(payload)
          .select("*")
          .single();
        if (error) {
          biRuntimeError("supabasePartnerRepository", "create", error, {
            table: "bi_partners",
          });
          throw error;
        }
        return partnerFromDatabase(data as PartnerRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async update(id, workspaceId, patch) {
      try {
        const payload = partnerPatchToDatabase(patch);
        const { data, error } = await requireClient()
          .from("bi_partners")
          .update(payload)
          .eq("id", id)
          .eq("workspace_id", workspaceId)
          .select("*")
          .single();
        if (error) throw error;
        return partnerFromDatabase(data as PartnerRow);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async archive(id, workspaceId) {
      try {
        const { error } = await requireClient()
          .from("bi_partners")
          .update({ is_archived: true })
          .eq("id", id)
          .eq("workspace_id", workspaceId);
        if (error) throw error;
      } catch (e) {
        throw normalizeError(e);
      }
    },
  };
}
