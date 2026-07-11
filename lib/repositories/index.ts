import { createClient } from "../supabase/client";
import { createSupabaseWorkspaceRepository } from "./supabaseWorkspaceRepository";
import { createSupabaseAssetRepository } from "./supabaseAssetRepository";
import { createSupabaseBudgetRepository } from "./supabaseBudgetRepository";
import { createSupabaseActivityRepository } from "./supabaseActivityRepository";

/** Wired Supabase repositories for browser (anon). Never touch Queue tables. */
export function getBiRepositories() {
  const client = createClient();
  return {
    client,
    workspaces: createSupabaseWorkspaceRepository(client),
    assets: createSupabaseAssetRepository(client),
    budget: createSupabaseBudgetRepository(client),
    activity: createSupabaseActivityRepository(client),
  };
}

export type { WorkspaceRepository } from "./workspaceRepository";
export type { AssetRepository } from "./assetRepository";
export type { BudgetRepository } from "./budgetRepository";
export type { ActivityRepository } from "./activityRepository";
