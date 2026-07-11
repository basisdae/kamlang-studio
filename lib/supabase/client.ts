import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnvStatus } from "./env";

/** Untyped DB surface — repositories cast table rows via mappers */
export type BiSupabaseClient = SupabaseClient;

let browserClient: BiSupabaseClient | null | undefined;

/**
 * Browser Supabase client (singleton).
 * Returns null when env is missing — callers should surface config error.
 */
export function createClient(): BiSupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const status = getSupabaseEnvStatus();
  if (!status.values) {
    browserClient = null;
    return null;
  }

  browserClient = createBrowserClient(
    status.values.url,
    status.values.anonKey
  ) as BiSupabaseClient;
  return browserClient;
}

/** Reset singleton (tests / hot env change) */
export function resetSupabaseClient() {
  browserClient = undefined;
}
