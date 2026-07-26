/**
 * Capture mobile screenshots for order design-system UX review.
 * Usage: node scripts/order-ds-screenshots.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { accessSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3001";
const OUT = join(process.cwd(), "review-screenshots", "order-ds");
mkdirSync(OUT, { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`;
accessSync(chrome);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: ["--no-sandbox", "--disable-gpu"],
  defaultViewport: {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
});

const page = await browser.newPage();

async function shot(name) {
  const path = join(OUT, name);
  await page.screenshot({ path, fullPage: false });
  console.log("wrote", path);
}

async function clickIncluding(text) {
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

async function setTheme(mode) {
  await page.evaluate((m) => {
    localStorage.setItem("tangtao.order.theme.v1", m);
  }, mode);
  await page.reload({ waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));
}

// Welcome light
await page.goto(`${BASE}/order`, { waitUntil: "networkidle0", timeout: 90000 });
await setTheme("light");
await shot("01-welcome-light-390.png");

await clickIncluding("เริ่มสั่งอาหาร");
await new Promise((r) => setTimeout(r, 400));
await shot("02-fulfillment-light-390.png");

await clickIncluding("ดูเมนู");
await new Promise((r) => setTimeout(r, 500));
await shot("03-menu-light-390.png");

await clickIncluding("ดูโครงหน้า Add-on");
await new Promise((r) => setTimeout(r, 500));
await shot("04-addon-light-390.png");

await clickIncluding("กลับไปเมนู");
await new Promise((r) => setTimeout(r, 400));
await clickIncluding("ดูตัวอย่างฟอร์มยืนยัน");
await new Promise((r) => setTimeout(r, 500));
await page.evaluate(() => {
  const inputs = [...document.querySelectorAll("input")];
  if (inputs[0]) {
    inputs[0].value = "ทดสอบ";
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (inputs[1]) {
    inputs[1].value = "0812345678";
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  }
});
// React controlled inputs need native setter
await page.$$eval("input", (inputs) => {
  const set = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  if (!set) return;
  if (inputs[0]) {
    set.call(inputs[0], "ทดสอบ");
    inputs[0].dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (inputs[1]) {
    set.call(inputs[1], "0812345678");
    inputs[1].dispatchEvent(new Event("input", { bubbles: true }));
  }
});
await shot("05-checkout-light-390.png");

await clickIncluding("ดูสรุปทดลอง");
await new Promise((r) => setTimeout(r, 500));
await shot("06-result-light-390.png");

await page.goto(`${BASE}/orders`, { waitUntil: "networkidle0", timeout: 90000 });
await setTheme("light");
await new Promise((r) => setTimeout(r, 500));
await shot("07-orders-light-390.png");

// Dark comparisons
await page.goto(`${BASE}/order`, { waitUntil: "networkidle0" });
await setTheme("dark");
await shot("08-welcome-dark-390.png");
await clickIncluding("เริ่มสั่งอาหาร");
await new Promise((r) => setTimeout(r, 300));
await clickIncluding("ดูเมนู");
await new Promise((r) => setTimeout(r, 400));
await shot("09-menu-dark-390.png");

await page.goto(`${BASE}/orders`, { waitUntil: "networkidle0" });
await setTheme("dark");
await new Promise((r) => setTimeout(r, 500));
await shot("10-orders-dark-390.png");

// h-scroll checks
const scrollCheck = {};
for (const w of [360, 390, 430]) {
  await page.setViewport({
    width: w,
    height: 800,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${BASE}/order`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400));
  scrollCheck[w] = await page.evaluate(() => ({
    hasHScroll:
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth + 1,
  }));
}
console.log("hScroll", JSON.stringify(scrollCheck));

await browser.close();
console.log("done");
