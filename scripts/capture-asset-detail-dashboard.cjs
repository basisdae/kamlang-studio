/**
 * Capture Asset Detail dashboard screenshots (desktop first viewport + mobile).
 * Usage: node scripts/capture-asset-detail-dashboard.cjs
 */
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const BASE = process.env.BI_BASE_URL || "https://kamlang-studio.vercel.app";
const ASSET_ID = "b2222222-b222-b222-b222-b22222220030";
const OUT = path.join(__dirname, "..", "review-screenshots");
const URL = `${BASE}/opening/assets/${ASSET_ID}`;

async function prepare(page) {
  await page.addInitScript(() => {
    localStorage.setItem("bi.currentWorkspace.v1", "opening");
  });
}

async function shot(page, name) {
  await page.goto(URL, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2500);
  const file = path.join(OUT, name);
  await page.screenshot({ path: file, fullPage: false });
  console.log("ok", name, page.url());
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 820 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await prepare(page);
    await shot(page, "v049-asset-detail-desktop-1280.png");
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await prepare(page);
    await shot(page, "v049-asset-detail-mobile-390.png");
    await context.close();
  }

  await browser.close();
  console.log("done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
