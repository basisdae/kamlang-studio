/**
 * Supabase service layer — connection helpers.
 * Components must not call createClient() for data; use repositories via providers.
 */

import { createClient, type BiSupabaseClient } from "./client";
import { getSupabaseEnvStatus } from "./env";

export type BiConnectionStatus = {
  configured: boolean;
  browserOnline: boolean;
  error: string | null;
};

export function getBrowserOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function getConnectionStatus(): BiConnectionStatus {
  const env = getSupabaseEnvStatus();
  return {
    configured: env.configured,
    browserOnline: getBrowserOnline(),
    error: env.error,
  };
}

/** Returns browser client or null when env missing */
export function getServiceClient(): BiSupabaseClient | null {
  return createClient();
}

export function requireServiceClient(): BiSupabaseClient {
  const client = createClient();
  if (!client) {
    const status = getSupabaseEnvStatus();
    throw new Error(status.error ?? "Supabase client ไม่พร้อม");
  }
  return client;
}

export async function pingWorkspace(
  client: BiSupabaseClient,
  slug = "tangtao"
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await client
    .from("bi_workspaces")
    .select("id")
    .eq("slug", slug)
    .limit(1);
  return { ok: !error, error: error?.message ?? null };
}
