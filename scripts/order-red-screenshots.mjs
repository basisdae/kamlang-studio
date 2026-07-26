/**
 * Capture Tangtao red-theme order screenshots (light/dark + widths).
 * Usage: node scripts/order-red-screenshots.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { accessSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3005";
const OUT = join(process.cwd(), "review-screenshots", "order-red");
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
  for (const b of await page.$$("button")) {
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
  await new Promise((r) => setTimeout(r, 500));
}

async function flowToMenu() {
  await clickIncluding("เริ่มสั่งอาหาร");
  await new Promise((r) => setTimeout(r, 250));
  await clickIncluding("รับหน้าร้าน");
  await new Promise((r) => setTimeout(r, 150));
  await clickIncluding("นำกลับ");
  await new Promise((r) => setTimeout(r, 150));
  await clickIncluding("ดูเมนู");
  await new Promise((r) => setTimeout(r, 400));
}

await page.goto(`${BASE}/order`, { waitUntil: "networkidle0", timeout: 90000 });
await setTheme("light");
await shot("01-welcome-light-390.png");
await flowToMenu();
await shot("02-menu-light-390.png");

const accent = await page.evaluate(() =>
  getComputedStyle(document.querySelector("[data-order-surface]")).getPropertyValue("--order-accent").trim()
);
console.log("accent", accent);

await clickIncluding("ดูโครงหน้า Add-on");
await new Promise((r) => setTimeout(r, 400));
await shot("03-addon-light-390.png");
await clickIncluding("กลับไปเมนู");
await new Promise((r) => setTimeout(r, 300));
await clickIncluding("ดูตะกร้า");
await new Promise((r) => setTimeout(r, 400));
await shot("04-cart-light-390.png");
await clickIncluding("ปิด");
await new Promise((r) => setTimeout(r, 200));
await clickIncluding("ดูตัวอย่างฟอร์มยืนยัน");
await new Promise((r) => setTimeout(r, 400));
await shot("05-checkout-light-390.png");
await clickIncluding("ดูสรุปทดลอง");
await new Promise((r) => setTimeout(r, 400));
await shot("06-result-light-390.png");

await page.goto(`${BASE}/orders`, { waitUntil: "networkidle0" });
await setTheme("light");
await shot("07-orders-light-390.png");

await page.goto(`${BASE}/order`, { waitUntil: "networkidle0" });
await setTheme("dark");
await shot("08-welcome-dark-390.png");
await flowToMenu();
await shot("09-menu-dark-390.png");
await page.goto(`${BASE}/orders`, { waitUntil: "networkidle0" });
await setTheme("dark");
await shot("10-orders-dark-390.png");

for (const w of [360, 390, 430]) {
  await page.setViewport({
    width: w,
    height: 800,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${BASE}/order`, { waitUntil: "networkidle0" });
  await setTheme("light");
  await shot(`width-${w}-welcome.png`);
}

const noLemon = !String(accent).toLowerCase().includes("e7f65b");
console.log(JSON.stringify({ accent, noLemon }, null, 2));
await browser.close();
