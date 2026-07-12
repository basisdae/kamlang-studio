/**
 * Checklist UX smoke — Quick Add, toolbar, select controls present
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
const page = await browser.newPage();
const consoles = [];
page.on("console", (m) => {
  if (m.type() === "error") consoles.push(m.text());
});
page.on("pageerror", (e) => consoles.push(String(e)));

await page.setViewport({ width: 390, height: 844 });
await page.goto(`${BASE}/opening/checklist/equipment`, {
  waitUntil: "networkidle0",
  timeout: 60000,
});
await new Promise((r) => setTimeout(r, 2200));

const report = { ok: true, failures: [], checks: {} };
const text = await page.evaluate(() => document.body.innerText);
report.checks = {
  quickAdd: /Quick Add|พิมพ์ชื่อ/.test(text),
  enterHint: /Enter/.test(text),
  search: Boolean(await page.$('input[type="search"], .kl-search input')),
  sort: /เรียง/.test(text),
  filter: /ทั้งหมด|ต้องจัดหา/.test(text),
  sticky: Boolean(await page.$(".kl-sticky-toolbar")),
  autofocus: await page.evaluate(
    () => document.activeElement?.id === "checklist-quick-add"
  ),
  overflow: await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 2
  ),
};

for (const [k, v] of Object.entries(report.checks)) {
  if (k === "overflow") {
    if (v) {
      report.ok = false;
      report.failures.push("overflow");
    }
    continue;
  }
  if (!v) {
    report.ok = false;
    report.failures.push(`missing ${k}`);
  }
}

const errs = consoles.filter((t) => !/hydrat|favicon|DevTools/i.test(t));
if (errs.length) {
  report.ok = false;
  report.failures.push(`console ${JSON.stringify(errs)}`);
}

writeFileSync("checklist-ux-acceptance.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(report.ok ? 0 : 1);
