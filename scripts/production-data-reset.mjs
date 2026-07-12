/**
 * Production data reset — wipe workspace usage data, re-seed empty templates.
 *
 * Keeps: schema, workspace row, RLS/config.
 * Clears: assets, purchases, repairs, budget items, activity, decision groups.
 * Inserts: Opening + Marketing checklist templates (status=planned, no prices).
 *
 * Usage: node --env-file=.env.local scripts/production-data-reset.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
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

const WS = "11111111-1111-1111-1111-111111111111";
const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const templates = JSON.parse(
  readFileSync(resolve("scripts/production-reset-templates.json"), "utf8")
);
const catalog = JSON.parse(
  readFileSync(resolve("scripts/first-real-data-catalog.json"), "utf8")
);

function blankAssetRow(partial) {
  return {
    workspace_id: WS,
    brand: null,
    model: null,
    quantity: 1,
    unit: "ชิ้น",
    estimated_unit_price: null,
    actual_unit_price: null,
    supplier_name: null,
    purchase_channel: null,
    purchase_url: null,
    priority: "must",
    status: "planned",
    purchase_date: null,
    specifications: {},
    notes: "Template · ยังไม่เริ่ม",
    warranty_months: null,
    warranty_expires_at: null,
    serial_number: null,
    decision_group_id: null,
    is_archived: false,
    ...partial,
  };
}

async function deleteAll(table) {
  const { data, error } = await client
    .from(table)
    .delete()
    .eq("workspace_id", WS)
    .select("id");
  if (error) throw new Error(`${table} delete: ${error.message}`);
  return data?.length ?? 0;
}

async function main() {
  console.log("Production reset — workspace", WS);

  const deleted = {
    activity: await deleteAll("bi_activity_logs"),
    purchases: await deleteAll("bi_asset_purchases"),
    repairs: await deleteAll("bi_asset_repairs"),
    budget: await deleteAll("bi_budget_items"),
  };

  await client
    .from("bi_assets")
    .update({ decision_group_id: null })
    .eq("workspace_id", WS);
  deleted.decisionGroups = await deleteAll("bi_asset_decision_groups");
  deleted.assets = await deleteAll("bi_assets");

  console.log("Cleared:", deleted);

  const openingRows = (catalog.assets || []).map((a) =>
    blankAssetRow({
      id: a.id,
      name: a.name,
      category: a.category,
      unit: a.unit || "ชิ้น",
      brand: a.brand || null,
    })
  );

  const { error: openingErr } = await client
    .from("bi_assets")
    .upsert(openingRows, { onConflict: "id" })
    .select("id");
  if (openingErr) throw new Error(`opening insert: ${openingErr.message}`);

  const marketingRows = templates.marketing.map((m, i) => {
    const seq = String(i + 1).padStart(12, "0");
    return blankAssetRow({
      id: `ffffffff-ffff-ffff-ffff-${seq}`,
      name: m.name,
      category: m.category,
      unit: "รายการ",
      notes: "Marketing template · ยังไม่เริ่ม",
    });
  });

  const { error: mktErr } = await client
    .from("bi_assets")
    .upsert(marketingRows, { onConflict: "id" })
    .select("id");
  if (mktErr) throw new Error(`marketing insert: ${mktErr.message}`);

  const { data: all, error: listErr } = await client
    .from("bi_assets")
    .select(
      "id, name, category, status, estimated_unit_price, actual_unit_price, is_archived"
    )
    .eq("workspace_id", WS)
    .eq("is_archived", false);
  if (listErr) throw listErr;

  const opening = (all || []).filter(
    (a) => !String(a.category).startsWith("การตลาด·")
  );
  const marketing = (all || []).filter((a) =>
    String(a.category).startsWith("การตลาด·")
  );
  const priced = (all || []).filter(
    (a) => a.estimated_unit_price != null || a.actual_unit_price != null
  );
  const notPlanned = (all || []).filter((a) => a.status !== "planned");

  const report = {
    cleared: deleted,
    openingTemplateCount: opening.length,
    marketingTemplateCount: marketing.length,
    pricedCount: priced.length,
    notPlannedCount: notPlanned.length,
    openingSample: opening.slice(0, 8).map((a) => a.name),
    marketingNames: marketing.map((a) => a.name),
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(
    resolve("scripts/production-reset-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log("Opening templates:", opening.length);
  console.log("Marketing templates:", marketing.length);
  console.log("Priced rows (should be 0):", priced.length);
  console.log("Non-planned (should be 0):", notPlanned.length);
  console.log("Report → scripts/production-reset-report.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
