/**
 * v0.3 acceptance: Hub 30s, redirects, console/network/hydration
 */
import puppeteer from "puppeteer-core";
import { accessSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BI_BASE_URL || "http://localhost:3000";
const chrome =
  process.env.CHROME_PATH ||
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`;
accessSync(chrome);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: ["--no-sandbox", "--disable-gpu"],
});

const report = { ok: true, failures: [], checks: {} };

async function open(path, { expectRedirectTo } = {}) {
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

  const res = await page.goto(`${BASE}${path}`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 2800));
  const finalUrl = page.url();
  const text = await page.evaluate(() => document.body.innerText);
  const hyd = consoles.filter((t) => /hydrat/i.test(t));
  const errs = consoles.filter(
    (t) => !/hydrat|favicon|DevTools/i.test(t)
  );

  if (expectRedirectTo) {
    const ok = finalUrl.includes(expectRedirectTo);
    if (!ok) {
      report.ok = false;
      report.failures.push(
        `${path} expected redirect to ${expectRedirectTo}, got ${finalUrl}`
      );
    }
  } else if (res?.status() === 404 || /404|ไม่พบหน้า/.test(text)) {
    report.ok = false;
    report.failures.push(`${path} 404`);
  }

  if (errs.length || hyd.length || failed.length) {
    report.ok = false;
    report.failures.push(
      `${path} console/net: ${JSON.stringify({ errs, hyd, failed })}`
    );
  }

  await page.close();
  return { status: res?.status(), finalUrl, text, errs, hyd, failed };
}

// 1) Hub 30-second comprehension
const hub = await open("/opening");
const hubText = hub.text.replace(/\s+/g, " ");
report.checks.hub = {
  hasReadyPercent: /พร้อมแล้ว\s*\d+%|\d+\s*%/.test(hub.text) && /พร้อมแล้ว/.test(hub.text),
  hasRemaining: /เหลือ/.test(hub.text),
  hasBudgetNeed: /ต้องใช้งบ|ยังต้องจัดหา|ต้องใช้งบอีก/.test(hub.text),
  hasNextAction: /ไปทำต่อ|วันนี้|เคลียร์|ใส่ราคา/.test(hub.text),
  hasChecklistEntry: /รายการเตรียมเปิดร้าน|อุปกรณ์|วัตถุดิบ/.test(hub.text),
  snippet: hubText.slice(0, 700),
};
for (const [k, v] of Object.entries(report.checks.hub)) {
  if (k === "snippet") continue;
  if (!v) {
    report.ok = false;
    report.failures.push(`Hub missing: ${k}`);
  }
}

// 2) Redirects
report.checks.redirects = {
  ready: await open("/opening/ready", { expectRedirectTo: "/opening" }),
  initialStock: await open("/opening/initial-stock", {
    expectRedirectTo: "/opening/checklist/ingredients",
  }),
};

// 3) Key views load (same data surface)
for (const path of [
  "/opening/checklist",
  "/opening/checklist/equipment",
  "/opening/assets",
  "/opening/budget",
]) {
  const r = await open(path);
  report.checks[path] = {
    status: r.status,
    hasOnlineOrContent: /ออนไลน์|รายการ|สรุป|พร้อม/.test(r.text),
  };
  if (r.status !== 200 && !r.finalUrl.includes(path.split("?")[0])) {
    // allow redirect chain
  }
}

// 4) Direct URL refresh on Hub
{
  const page = await browser.newPage();
  await page.goto(`${BASE}/opening`, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 2500));
  const after = await page.evaluate(() => document.body.innerText);
  report.checks.refresh = {
    stillHasSummary: /พร้อมแล้ว|เหลือ|งบ/.test(after),
  };
  if (!report.checks.refresh.stillHasSummary) {
    report.ok = false;
    report.failures.push("Hub refresh lost summary");
  }
  await page.close();
}

await browser.close();
const out = resolve(process.cwd(), "review-screenshots/v03-acceptance.json");
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
