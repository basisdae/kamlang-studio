/**
 * Apply First Real Data SQL against Supabase (anon key).
 * Usage: node --env-file=.env.local scripts/apply-first-real-data.mjs
 * Does not print secrets.
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
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or ANON_KEY");
  process.exit(1);
}

const sqlPath = resolve(
  "supabase/migrations/20260712010000_first_real_data_tangtao.sql"
);
const sql = readFileSync(sqlPath, "utf8");

const WS = "11111111-1111-1111-1111-111111111111";
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function rpcOrFail() {
  // Prefer exec via postgres if available; otherwise stepwise JS API
  const { error } = await client.rpc("exec_sql", { query: sql }).maybeSingle?.() ?? { error: { message: "no rpc" } };
  return error;
}

async function applyStepwise() {
  const seedAssetIds = [
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0009",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0010",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0011",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0012",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0013",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0014",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0015",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a1",
    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a2",
  ];

  // 1 detach POS
  await client
    .from("bi_asset_decision_groups")
    .update({ selected_asset_id: null })
    .eq("id", "22222222-2222-2222-2222-222222222201")
    .eq("workspace_id", WS);

  await client
    .from("bi_assets")
    .update({ decision_group_id: null })
    .eq("workspace_id", WS)
    .eq("decision_group_id", "22222222-2222-2222-2222-222222222201");

  // 2 archive seed assets
  const { data: archivedRows, error: archErr } = await client
    .from("bi_assets")
    .update({ is_archived: true })
    .eq("workspace_id", WS)
    .in("id", seedAssetIds)
    .select("id");
  if (archErr) throw archErr;

  // 3 delete seed purchases / budget / POS group
  await client
    .from("bi_asset_purchases")
    .delete()
    .eq("workspace_id", WS)
    .in("id", [
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001",
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002",
    ]);

  await client
    .from("bi_budget_items")
    .delete()
    .eq("workspace_id", WS)
    .in("id", [
      "cccccccc-cccc-cccc-cccc-cccccccc0001",
      "cccccccc-cccc-cccc-cccc-cccccccc0002",
      "cccccccc-cccc-cccc-cccc-cccccccc0003",
      "cccccccc-cccc-cccc-cccc-cccccccc0008",
      "cccccccc-cccc-cccc-cccc-cccccccc0010",
    ]);

  await client
    .from("bi_asset_decision_groups")
    .delete()
    .eq("workspace_id", WS)
    .eq("id", "22222222-2222-2222-2222-222222222201");

  // 4 parse INSERT values from migration is heavy — load catalog from companion JSON
  const catalog = JSON.parse(
    readFileSync(resolve("scripts/first-real-data-catalog.json"), "utf8")
  );

  const { data: upserted, error: upErr } = await client
    .from("bi_assets")
    .upsert(catalog.assets, { onConflict: "id" })
    .select("id, status, estimated_unit_price, quantity");
  if (upErr) throw upErr;

  const budgetRows = (upserted || []).map((a) => {
    const suffix = a.id.slice(-4); // 0001..0039
    const est = a.estimated_unit_price;
    const meta = catalog.assets.find((x) => x.id === a.id);
    return {
      id: `ffffffff-ffff-ffff-ffff-ffffeeee${suffix}`,
      workspace_id: WS,
      asset_id: a.id,
      decision_group_id: null,
      name: meta?.name ?? a.id,
      category: meta?.category ?? "",
      planned_amount:
        est == null ? null : Number(est) * Number(a.quantity || 1),
      actual_amount: null,
      priority: "must",
      status: a.status === "in_use" ? "received" : "ready_to_buy",
      notes: meta?.notes ?? "",
    };
  });

  const { error: bErr } = await client
    .from("bi_budget_items")
    .upsert(budgetRows, { onConflict: "id" });
  if (bErr) throw bErr;

  return {
    archived: archivedRows?.length ?? 0,
    inserted: upserted?.length ?? 0,
    owned: (upserted || []).filter((a) => a.status === "in_use").length,
    need: (upserted || []).filter((a) => a.status === "planned").length,
    upserted,
  };
}

async function report() {
  const { data: real } = await client
    .from("bi_assets")
    .select("id, name, status, quantity, estimated_unit_price, is_archived")
    .eq("workspace_id", WS)
    .like("id", "eeeeeeee-eeee-eeee-eeee-%");

  const active = (real || []).filter((a) => !a.is_archived);
  let total = 0;
  let owned = 0;
  let need = 0;
  let unknown = 0;
  for (const a of active) {
    const line =
      a.estimated_unit_price == null
        ? null
        : Number(a.estimated_unit_price) * Number(a.quantity || 1);
    if (a.status === "in_use") {
      if (line != null) owned += line;
      if (line != null) total += line;
    } else if (a.status === "planned") {
      if (line != null) {
        need += line;
        total += line;
      } else unknown += 1;
    } else if (line != null) {
      total += line;
    }
  }

  const { count: archivedSeed } = await client
    .from("bi_assets")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", WS)
    .eq("is_archived", true)
    .like("id", "aaaaaaaa-aaaa-aaaa-aaaa-%");

  console.log(
    JSON.stringify(
      {
        archivedSeedCount: archivedSeed,
        realActiveCount: active.length,
        ownedCount: active.filter((a) => a.status === "in_use").length,
        needCount: active.filter((a) => a.status === "planned").length,
        inventoryTotal: total,
        inventoryOwned: owned,
        inventoryNeed: need,
        inventoryActualSpend: 0,
        unknownNeedPrice: unknown,
        missingExpected: 39 - active.length,
      },
      null,
      2
    )
  );
}

const result = await applyStepwise();
console.log(
  JSON.stringify(
    {
      archived: result.archived,
      upserted: result.inserted,
      ownedOnUpsert: result.owned,
      needOnUpsert: result.need,
    },
    null,
    2
  )
);
await report();
