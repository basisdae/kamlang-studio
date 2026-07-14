/**
 * Apply bi_partners Shared Core migration.
 * Prints SQL path when DDL cannot run via anon REST.
 *
 * Usage: node --env-file=.env.local scripts/apply-bi-partners.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function normalizeUrl(raw) {
  let url = (raw || "").trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  try {
    const u = new URL(url);
    if (u.pathname && u.pathname !== "/") url = `${u.protocol}//${u.host}`;
  } catch {
    /* keep */
  }
  return url;
}

const url = normalizeUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || "");
const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const sqlPath = resolve(
  "supabase/migrations/20260714180000_create_bi_partners.sql"
);

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
  process.exit(1);
}

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const WS = "11111111-1111-1111-1111-111111111111";

async function main() {
  const probe = await client.from("bi_partners").select("id").limit(1);
  if (!probe.error) {
    console.log("OK · bi_partners already exists");
    const { count } = await client
      .from("bi_partners")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", WS)
      .eq("is_archived", false);
    console.log(`active partners (ตั้งเตา): ${count ?? 0}`);
    return;
  }

  const msg = probe.error.message || "";
  const missing =
    /could not find|does not exist|schema cache|PGRST/i.test(msg) ||
    probe.error.code === "42P01" ||
    probe.error.code === "PGRST205";

  if (!missing) {
    console.error("Probe failed:", probe.error.message);
    process.exit(1);
  }

  console.error("bi_partners missing — run this SQL in Supabase SQL Editor:");
  console.error(`  ${sqlPath}`);
  console.error("");
  console.error(readFileSync(sqlPath, "utf8"));
  process.exit(2);
}

main();
