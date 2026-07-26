/**
 * Capture mobile screenshots for /order UX review.
 * Usage: node scripts/order-ux-screenshots.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { accessSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || process.env.PROD_BASE_URL || "http://127.0.0.1:3000";
const OUT = join(process.cwd(), "review-screenshots", "order-ux");
mkdirSync(OUT, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`;
accessSync(chrome);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: ["--no-sandbox", "--disable-gpu", "--window-size=390,844"],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
});

const page = await browser.newPage();
await page.setUserAgent(
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
);

async function shot(name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("wrote", path);
}

async function clickButtonIncluding(text) {
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const t = await page.evaluate((el) => (el.textContent || "").trim(), b);
    if (t.includes(text)) {
      await b.click();
      return true;
    }
  }
  return false;
}

await page.goto(`${BASE}/order`, { waitUntil: "networkidle0", timeout: 90000 });
await page.waitForFunction(
  () => !document.body.innerText.includes("กำลังโหลดเมนู"),
  { timeout: 30000 }
).catch(() => {});
await new Promise((r) => setTimeout(r, 800));
await shot("order-menu-390.png");

const hasBiLink = await page.evaluate(() => {
  const text = document.body.innerText || "";
  const anchors = [...document.querySelectorAll("a")].map((a) => a.getAttribute("href") || "");
  return {
    textHasBusinessInsight: /Business Insight/.test(text.slice(0, 400)),
    hrefs: anchors.filter((h) =>
      /^\/(opening|finance|partners|modes|insight|settings)/.test(h)
    ),
  };
});
console.log("isolation", JSON.stringify(hasBiLink));

await clickButtonIncluding("ดูตะกร้า");
await new Promise((r) => setTimeout(r, 500));
await shot("order-cart-390.png");

await clickButtonIncluding("ปิด");
await new Promise((r) => setTimeout(r, 400));

await clickButtonIncluding("ดูตัวอย่างฟอร์มยืนยัน");
await new Promise((r) => setTimeout(r, 600));
await shot("order-checkout-pickup-390.png");

await clickButtonIncluding("ปิด");
await new Promise((r) => setTimeout(r, 300));
await clickButtonIncluding("จัดส่ง");
await new Promise((r) => setTimeout(r, 300));
await clickButtonIncluding("ดูตัวอย่างฟอร์มยืนยัน");
await new Promise((r) => setTimeout(r, 600));
await shot("order-checkout-delivery-390.png");

await page.goto(`${BASE}/order?source=staff`, {
  waitUntil: "networkidle0",
  timeout: 90000,
});
await new Promise((r) => setTimeout(r, 800));
const staffOk = await page.evaluate(() => {
  const el = document.querySelector("[data-order-source]");
  return el?.getAttribute("data-order-source") === "staff";
});
console.log("staffSource", staffOk);
await shot("order-staff-390.png");

const scrollCheck = {};
for (const w of [360, 390, 430]) {
  await page.setViewport({ width: w, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(`${BASE}/order`, { waitUntil: "networkidle0", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 500));
  scrollCheck[w] = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  }));
}
console.log("hScroll", JSON.stringify(scrollCheck));

await browser.close();
console.log("done");
