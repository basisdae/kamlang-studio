/**
 * v0.3.1 polish acceptance — empty/search/sort/sticky/no console errors
 */
import puppeteer from "puppeteer-core";
import { accessSync, writeFileSync } from "node:fs";

const BASE = process.env.BI_BASE_URL || "http://localhost:3000";
const chrome =
  process.env.CHROME_PATH ||
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`;
accessSync(chrome);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: ["--no-sandbox", "--disable-gpu", "--window-size=390,844"],
});

const report = { ok: true, failures: [], checks: {} };

async function visit(path, widths = [390, 768, 1280]) {
  const page = await browser.newPage();
  const consoles = [];
  const failed = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoles.push(m.text());
  });
  page.on("pageerror", (e) => consoles.push(String(e)));
  page.on("response", (r) => {
    const u = r.url();
    if (
      (u.includes("localhost") || u.includes("supabase.co")) &&
      r.status() >= 400
    ) {
      failed.push({ url: u, status: r.status() });
    }
  });

  const overflowByWidth = {};
  for (const w of widths) {
    await page.setViewport({ width: w, height: 844, deviceScaleFactor: 1 });
    const res = await page.goto(`${BASE}${path}`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    await new Promise((r) => setTimeout(r, 1800));
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 2;
    });
    overflowByWidth[w] = overflow;
    if (overflow) {
      report.ok = false;
      report.failures.push(`${path} overflow at ${w}px`);
    }
    if (res?.status() === 404) {
      report.ok = false;
      report.failures.push(`${path} 404`);
    }
  }

  const text = await page.evaluate(() => document.body.innerText);
  const hasSearch = await page.$('input[type="search"], .kl-search input');
  const hasSort = await page.evaluate(() =>
    /เรียง/.test(document.body.innerText)
  );
  const sticky = await page.$(".kl-sticky-summary");
  const errs = consoles.filter((t) => !/hydrat|favicon|DevTools/i.test(t));
  const hyd = consoles.filter((t) => /hydrat/i.test(t));
  if (errs.length || hyd.length || failed.length) {
    report.ok = false;
    report.failures.push(
      `${path} console/net: ${JSON.stringify({ errs, hyd, failed })}`
    );
  }

  await page.close();
  return {
    text,
    hasSearch: Boolean(hasSearch),
    hasSort,
    sticky: Boolean(sticky),
    overflowByWidth,
    errs,
    hyd,
    failed,
  };
}

const pages = [
  "/opening",
  "/opening/checklist",
  "/opening/checklist/equipment",
  "/opening/budget",
  "/opening/assets",
  "/opening/calendar",
  "/opening/documents",
];

for (const path of pages) {
  const r = await visit(path);
  report.checks[path] = {
    hasSearch: r.hasSearch,
    hasSort: r.hasSort,
    sticky: r.sticky,
    overflowByWidth: r.overflowByWidth,
    sample: r.text.slice(0, 120).replace(/\s+/g, " "),
  };
}

// Expectations
const needSearch = [
  "/opening/checklist/equipment",
  "/opening/budget",
  "/opening/assets",
  "/opening/calendar",
  "/opening/documents",
];
for (const p of needSearch) {
  if (!report.checks[p]?.hasSearch) {
    report.ok = false;
    report.failures.push(`${p} missing search`);
  }
}

if (!report.checks["/opening/checklist"]?.sticky) {
  report.ok = false;
  report.failures.push("/opening/checklist missing sticky summary");
}
if (!report.checks["/opening/checklist/equipment"]?.sticky) {
  report.ok = false;
  report.failures.push("/opening/checklist/equipment missing sticky summary");
}

// Autofocus on new asset form
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${BASE}/opening/assets/new`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 1200));
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return el?.id === "asset-name" || el?.getAttribute("name") === "name";
  });
  report.checks.newAssetAutofocus = focused;
  if (!focused) {
    report.ok = false;
    report.failures.push("/opening/assets/new name not autofocused");
  }
  await page.close();
}

writeFileSync("v031-acceptance.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(report.ok ? 0 : 1);
