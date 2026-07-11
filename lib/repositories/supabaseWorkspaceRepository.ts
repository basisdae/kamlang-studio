import type { BiSupabaseClient } from "../supabase/client";
import { configError, normalizeError, notFoundError } from "../supabase/errors";
import {
  workspaceFromDatabase,
  type WorkspaceRow,
} from "../mappers/workspaceMapper";
import type { Workspace } from "../types/workspace";
import type { WorkspaceRepository } from "./workspaceRepository";

const DEFAULT_SLUG = "tangtao";

export function createSupabaseWorkspaceRepository(
  client: BiSupabaseClient | null
): WorkspaceRepository {
  function requireClient(): BiSupabaseClient {
    if (!client) throw configError();
    return client;
  }

  return {
    async list() {
      try {
        const { data, error } = await requireClient()
          .from("bi_workspaces")
          .select("*")
          .order("name");
        if (error) throw error;
        return ((data ?? []) as WorkspaceRow[]).map(workspaceFromDatabase);
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async getById(id: string) {
      try {
        const { data, error } = await requireClient()
          .from("bi_workspaces")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return data ? workspaceFromDatabase(data as WorkspaceRow) : null;
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async getBySlug(slug: string) {
      try {
        const { data, error } = await requireClient()
          .from("bi_workspaces")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (error) throw error;
        return data ? workspaceFromDatabase(data as WorkspaceRow) : null;
      } catch (e) {
        throw normalizeError(e);
      }
    },

    async getDefault(): Promise<Workspace> {
      const ws = await this.getBySlug(DEFAULT_SLUG);
      if (!ws) throw notFoundError("workspace ตั้งเตา");
      return ws;
    },
  };
}
