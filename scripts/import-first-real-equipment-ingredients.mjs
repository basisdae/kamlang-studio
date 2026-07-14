/**
 * Import First Real Equipment & Ingredient Data for ตั้งเตา.
 * Replaces blank Opening templates only. Keeps Marketing templates.
 *
 * Price rules (no schema migration):
 * - estimated_unit_price = min (fixed or low end of range) for Budget rollup
 * - specifications.estimatedMinPrice / estimatedMaxPrice
 * - specifications.source = "Initial Setup"
 * - null prices when unknown + note
 *
 * Usage: node --env-file=.env.local scripts/import-first-real-equipment-ingredients.mjs
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
const catalog = JSON.parse(
  readFileSync(resolve("scripts/first-real-equipment-ingredients.json"), "utf8")
);

const client = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function isMarketing(category) {
  return String(category).startsWith("การตลาด·");
}

function toRow(item) {
  const min = item.min == null ? null : Number(item.min);
  const max = item.max == null ? null : Number(item.max);
  return {
    id: item.id,
    workspace_id: WS,
    name: item.name,
    category: item.category,
    brand: item.brand,
    model: null,
    quantity: 1,
    unit: item.unit || "ชิ้น",
    estimated_unit_price: min,
    actual_unit_price: null,
    supplier_name: null,
    purchase_channel: null,
    purchase_url: null,
    priority: "must",
    status: item.status,
    purchase_date: null,
    specifications: {
      source: catalog.source,
      section: item.section,
      requiredForOpening: true,
      estimatedMinPrice: min,
      estimatedMaxPrice: max,
    },
    notes: item.notes || null,
    warranty_months: null,
    warranty_expires_at: null,
    serial_number: null,
    decision_group_id: null,
    is_archived: false,
  };
}

async function main() {
  console.log("Import First Real Equipment & Ingredients —", catalog.assets.length);

  // Load current
  const { data: current, error: curErr } = await client
    .from("bi_assets")
    .select("id, category, is_archived")
    .eq("workspace_id", WS);
  if (curErr) throw curErr;

  const openingIds = (current || [])
    .filter((a) => !isMarketing(a.category))
    .map((a) => a.id);

  if (openingIds.length) {
    await client.from("bi_budget_items").delete().in("asset_id", openingIds);
    await client.from("bi_asset_purchases").delete().in("asset_id", openingIds);
    await client.from("bi_asset_repairs").delete().in("asset_id", openingIds);
    const { error: delErr } = await client
      .from("bi_assets")
      .delete()
      .in("id", openingIds);
    if (delErr) throw delErr;
    console.log("Removed previous Opening rows:", openingIds.length);
  }

  const rows = catalog.assets.map(toRow);
  const { data: inserted, error: upErr } = await client
    .from("bi_assets")
    .upsert(rows, { onConflict: "id" })
    .select("id, name, category, status, estimated_unit_price, notes, specifications");
  if (upErr) throw upErr;

  const { data: all } = await client
    .from("bi_assets")
    .select(
      "id, name, category, status, estimated_unit_price, notes, specifications, is_archived"
    )
    .eq("workspace_id", WS)
    .eq("is_archived", false);

  const opening = (all || []).filter((a) => !isMarketing(a.category));
  const marketing = (all || []).filter((a) => isMarketing(a.category));
  const owned = opening.filter((a) => a.status === "in_use");
  const planned = opening.filter((a) => a.status === "planned");
  const noPrice = opening.filter((a) => a.estimated_unit_price == null);
  const ranged = opening.filter((a) => {
    const specs = a.specifications || {};
    return (
      specs.estimatedMinPrice != null &&
      specs.estimatedMaxPrice != null &&
      Number(specs.estimatedMinPrice) !== Number(specs.estimatedMaxPrice)
    );
  });

  let needMoney = 0;
  let ownedMoney = 0;
  for (const a of opening) {
    const p = a.estimated_unit_price;
    if (p == null) continue;
    if (a.status === "in_use") ownedMoney += Number(p);
    else if (a.status === "planned") needMoney += Number(p);
  }

  const byCategory = {};
  for (const a of opening) {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    openingCount: opening.length,
    marketingCount: marketing.length,
    inUseCount: owned.length,
    plannedCount: planned.length,
    noPriceCount: noPrice.length,
    rangePriceCount: ranged.length,
    moneyNeedEstimateMin: needMoney,
    moneyOwnedEstimateMin: ownedMoney,
    byCategory,
    noPriceNames: noPrice.map((a) => a.name),
    inUseNames: owned.map((a) => a.name),
    inserted: (inserted || []).length,
    rules: {
      priceColumns:
        "estimated_unit_price = min; range in specifications.estimatedMinPrice/MaxPrice",
      source: "Initial Setup",
      checkmark: "in_use",
      noCheck: "planned",
    },
  };

  writeFileSync(
    resolve("scripts/first-real-equipment-ingredients-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(JSON.stringify(report, null, 2));
  console.log("Report → scripts/first-real-equipment-ingredients-report.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
