/**
 * Capture Online v0.2 review screenshots (32–40).
 * Run: npx playwright@1.49.1 install chromium && node scripts/capture-online-v02.mjs
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.BI_BASE_URL || "http://localhost:3000";
const OUT = path.join(__dirname, "..", "review-screenshots");

async function shot(page, name, url) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1200);
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: true });
  console.log("ok", name);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await shot(page, "32-assets-supabase.png", `${BASE}/opening/assets`);
  await shot(page, "33-asset-create-online.png", `${BASE}/opening/assets/new`);

  // Prefer first asset from list link if present
  await page.goto(`${BASE}/opening/assets`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });
  await page.waitForTimeout(1000);
  const first = await page.locator('a[href^="/opening/assets/"]').first();
  let detailHref = null;
  if (await first.count()) {
    detailHref = await first.getAttribute("href");
  }

  if (detailHref && !detailHref.endsWith("/new")) {
    await shot(page, "35-asset-detail-online.png", `${BASE}${detailHref}`);
    await shot(
      page,
      "34-asset-edit-online.png",
      `${BASE}${detailHref}/edit`
    );
    await shot(
      page,
      "36-asset-purchase-online.png",
      `${BASE}${detailHref}/edit?mode=buy`
    );
    await page.goto(`${BASE}${detailHref}`, {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await page.waitForTimeout(800);
    const repairTab = page.getByRole("button", { name: "ประวัติการซ่อม" });
    if (await repairTab.count()) {
      await repairTab.click();
      await page.waitForTimeout(400);
    }
    const addRepair = page.getByRole("button", { name: /เพิ่มประวัติซ่อม/ }).first();
    if (await addRepair.count()) {
      await addRepair.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({
      path: path.join(OUT, "37-asset-repair-online.png"),
      fullPage: true,
    });
    console.log("ok", "37-asset-repair-online.png");
  } else {
    console.warn("skip detail/edit shots — no asset links");
  }

  await shot(page, "38-budget-supabase.png", `${BASE}/opening/budget`);
  await shot(page, "40-online-status.png", `${BASE}/status`);

  // Multi-browser note frame: assets list as sync proof surface
  await shot(page, "39-multi-browser-test.png", `${BASE}/opening/assets`);

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
