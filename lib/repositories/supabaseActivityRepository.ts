import type { BiSupabaseClient } from "../supabase/client";
import { configError, normalizeError } from "../supabase/errors";
import {
  activityFromDatabase,
  activityToDatabase,
  type ActivityRow,
} from "../mappers/activityMapper";
import type { ActivityLog, ActivityWriteInput } from "../types/activity";
import type { ActivityRepository } from "./activityRepository";

export function createSupabaseActivityRepository(
  client: BiSupabaseClient | null
): ActivityRepository {
  function requireClient(): BiSupabaseClient {
    if (!client) throw configError();
    return client;
  }

  return {
    async create(input: ActivityWriteInput): Promise<ActivityLog | null> {
      try {
        const { data, error } = await requireClient()
          .from("bi_activity_logs")
          .insert(activityToDatabase(input))
          .select("*")
          .single();
        if (error) throw error;
        return activityFromDatabase(data as ActivityRow);
      } catch (e) {
        // Soft-fail at repository level — services may swallow
        console.warn("[bi_activity_logs]", normalizeError(e).message);
        return null;
      }
    },

    async listByWorkspace(workspaceId, limit = 50) {
      try {
        const { data, error } = await requireClient()
          .from("bi_activity_logs")
          .select("*")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        return ((data ?? []) as ActivityRow[]).map(activityFromDatabase);
      } catch (e) {
        throw normalizeError(e);
      }
    },
  };
}
