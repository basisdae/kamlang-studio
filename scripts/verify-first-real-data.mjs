import { createClient } from "@supabase/supabase-js";

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
const c = createClient(url, key, { auth: { persistSession: false } });
const WS = "11111111-1111-1111-1111-111111111111";

const { data, error } = await c
  .from("bi_assets")
  .select("id,name,status,is_archived,estimated_unit_price,quantity")
  .eq("workspace_id", WS);
if (error) {
  console.error(error);
  process.exit(1);
}

const all = data || [];
const seed = all.filter((a) => String(a.id).startsWith("aaaaaaaa"));
const real = all.filter((a) => String(a.id).startsWith("eeeeeeee"));
const active = real.filter((a) => !a.is_archived);

let total = 0;
let owned = 0;
let need = 0;
let unk = 0;
for (const a of active) {
  const line =
    a.estimated_unit_price == null
      ? null
      : Number(a.estimated_unit_price) * Number(a.quantity || 1);
  if (a.status === "in_use") {
    if (line != null) {
      owned += line;
      total += line;
    }
  } else if (a.status === "planned") {
    if (line != null) {
      need += line;
      total += line;
    } else unk += 1;
  } else if (line != null) {
    total += line;
  }
}

const { data: budgets } = await c
  .from("bi_budget_items")
  .select("id,name,planned_amount,actual_amount")
  .eq("workspace_id", WS);
const { data: groups } = await c
  .from("bi_asset_decision_groups")
  .select("id,name")
  .eq("workspace_id", WS);
const { data: purchases } = await c
  .from("bi_asset_purchases")
  .select("id")
  .eq("workspace_id", WS);

console.log(
  JSON.stringify(
    {
      totalAssets: all.length,
      seedArchived: seed.filter((a) => a.is_archived).length,
      seedActive: seed.filter((a) => !a.is_archived).length,
      realActive: active.length,
      owned: active.filter((a) => a.status === "in_use").length,
      need: active.filter((a) => a.status === "planned").length,
      inventoryTotal: total,
      inventoryOwned: owned,
      inventoryNeed: need,
      inventoryActualSpend: 0,
      unknownNeed: unk,
      budgetLines: (budgets || []).length,
      decisionGroups: (groups || []).length,
      purchases: (purchases || []).length,
      sampleOwned: active.filter((a) => a.status === "in_use").map((a) => a.name),
      incomplete: active
        .filter((a) => a.status === "planned" && a.estimated_unit_price == null)
        .map((a) => a.name),
    },
    null,
    2
  )
);
