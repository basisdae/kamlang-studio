/**
 * Opening Hub polish — 30s comprehension + overflow + no console errors
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
  args: ["--no-sandbox", "--disable-gpu"],
});

const report = { ok: true, failures: [], checks: {} };
const page = await browser.newPage();
const consoles = [];
page.on("console", (m) => {
  if (m.type() === "error") consoles.push(m.text());
});
page.on("pageerror", (e) => consoles.push(String(e)));

for (const w of [390, 768, 1280]) {
  await page.setViewport({ width: w, height: 844 });
  await page.goto(`${BASE}/opening`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 2500));
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
  );
  report.checks[`overflow_${w}`] = overflow;
  if (overflow) {
    report.ok = false;
    report.failures.push(`overflow at ${w}`);
  }
}

const text = await page.evaluate(() => document.body.innerText);
const has = (re) => re.test(text);
report.checks.hub30s = {
  readyPercent: has(/พร้อมแล้ว/) && has(/%/),
  remaining: has(/เหลืออีก/),
  budget: has(/งบที่ต้องจัดหา|ต้องใช้งบ|จัดหา/),
  cta: has(/ไปทำต่อ/),
  preview: has(/รายการที่ต้องทำต่อ|เคลียร์รายการ/),
  nextStep: has(/สิ่งที่ควรทำต่อ|ไปทำต่อ/),
  activity: has(/กิจกรรมล่าสุด|ยังไม่มีกิจกรรม/),
};

for (const [k, v] of Object.entries(report.checks.hub30s)) {
  if (!v) {
    report.ok = false;
    report.failures.push(`missing hub signal: ${k}`);
  }
}

const errs = consoles.filter((t) => !/hydrat|favicon|DevTools/i.test(t));
if (errs.length) {
  report.ok = false;
  report.failures.push(`console: ${JSON.stringify(errs)}`);
}

writeFileSync("hub-polish-acceptance.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(report.ok ? 0 : 1);
