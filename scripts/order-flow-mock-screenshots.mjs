/**
 * Capture /order mock-catalog flow screenshots (390px).
 * Usage: node scripts/order-flow-mock-screenshots.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3005";
const OUT = join(process.cwd(), "review-screenshots", "order-flow-mock");
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

async function fill(selector, value) {
  const el = await page.$(selector);
  if (!el) throw new Error(`missing ${selector}`);
  await el.click({ clickCount: 3 });
  await el.type(value);
}

async function hScrollCheck(label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });
  const ok =
    overflow.scrollWidth <= overflow.clientWidth + 1 &&
    overflow.bodyScrollWidth <= overflow.clientWidth + 1;
  console.log(label, ok ? "no-h-scroll" : "H-SCROLL", overflow);
  return ok;
}

const report = { base: BASE, widths: {}, steps: [] };

await page.goto(`${BASE}/order`, { waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(() =>
  localStorage.setItem("tangtao.order.theme.v1", "light")
);
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 400));

await shot("01-welcome.png");
report.steps.push("welcome");

await clickIncluding("เริ่มสั่งอาหาร");
await new Promise((r) => setTimeout(r, 300));
await shot("02-fulfillment.png");
report.steps.push("fulfillment");

const bodyText = await page.evaluate(() => document.body.innerText);
if (bodyText.includes("นั่งรอ") || bodyText.includes("นำกลับ")) {
  throw new Error("pickup sit/takeaway options still visible");
}
if (
  bodyText.includes("bi_products") ||
  bodyText.includes("bi_menus") ||
  bodyText.includes("ดูโครงหน้า Add-on")
) {
  throw new Error("technical copy still visible on customer UI");
}

await clickIncluding("รับหน้าร้าน");
await new Promise((r) => setTimeout(r, 400));
await shot("03-categories-banner.png");
report.steps.push("categories");

await clickIncluding("โตเกียว");
await new Promise((r) => setTimeout(r, 400));
await shot("04-tokyo-featured.png");
report.steps.push("tokyo-featured");

for (const [tab, file] of [
  ["ขายดี", "05-tokyo-bestsellers.png"],
  ["ไส้ปกติ", "06-tokyo-regular.png"],
  ["ไส้พิเศษ", "07-tokyo-special.png"],
]) {
  await clickIncluding(tab);
  await new Promise((r) => setTimeout(r, 250));
  await shot(file);
  report.steps.push(tab);
}

await clickIncluding("เพิ่ม");
await new Promise((r) => setTimeout(r, 200));

await page.goBack();
await new Promise((r) => setTimeout(r, 350));
await clickIncluding("แซนด์วิช");
await new Promise((r) => setTimeout(r, 350));
await shot("08-sandwich.png");
report.steps.push("sandwich");

await clickIncluding("เพิ่ม");
await new Promise((r) => setTimeout(r, 200));
await clickIncluding("ดูตะกร้า");
await new Promise((r) => setTimeout(r, 350));
await shot("09-cart.png");
report.steps.push("cart");

await clickIncluding("ไปยืนยัน");
await new Promise((r) => setTimeout(r, 350));
await shot("10-checkout.png");
report.steps.push("checkout");

await fill('input[autocomplete="nickname"]', "ทดสอบ");
await fill('input[autocomplete="tel"]', "0812345678");
await clickIncluding("ดูสรุปทดลอง");
await new Promise((r) => setTimeout(r, 400));
await shot("11-prototype-summary.png");
report.steps.push("result");

const resultText = await page.evaluate(() => document.body.innerText);
if (!resultText.includes("ยังไม่ได้ส่ง")) {
  console.warn("warning: result copy may miss 'ยังไม่ได้ส่ง'");
}

await page.goto(`${BASE}/order?source=staff`, {
  waitUntil: "networkidle0",
});
await new Promise((r) => setTimeout(r, 300));
const staffOk = await page.evaluate(() =>
  document.body.innerText.includes("โหมดพนักงาน")
);
report.staffContext = staffOk;
await shot("12-staff-welcome.png");

for (const w of [360, 390, 430]) {
  await page.setViewport({
    width: w,
    height: 800,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.goto(`${BASE}/order?step=categories`, {
    waitUntil: "networkidle0",
  });
  await new Promise((r) => setTimeout(r, 300));
  report.widths[w] = await hScrollCheck(`width-${w}`);
  await shot(`width-${w}-categories.png`);
}

writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
