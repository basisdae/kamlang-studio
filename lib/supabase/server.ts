import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvStatus } from "./env";

/** Server Components / Route Handlers — null when env missing */
export async function createClient() {
  const status = getSupabaseEnvStatus();
  if (!status.values) return null;

  const cookieStore = await cookies();

  return createServerClient(status.values.url, status.values.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          /* Server Component — session refresh via middleware */
        }
      },
    },
  });
}
