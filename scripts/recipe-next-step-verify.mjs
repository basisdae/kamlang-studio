/**
 * Smoke test recipe next-step + menu draft + duplicate guard.
 * Usage: node scripts/recipe-next-step-verify.mjs [baseUrl]
 */
import puppeteer from "puppeteer-core";
import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.argv[2] || "http://127.0.0.1:3007";
const OUT = join(process.cwd(), "review-screenshots", "recipe-next-step");
mkdirSync(OUT, { recursive: true });
const chrome =
  process.env.CHROME_PATH ||
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`;
accessSync(chrome);

const RECIPE_ID = "qa-recipe-next-step-1";
const now = new Date().toISOString();
const fixtureRecipe = {
  id: RECIPE_ID,
  menuName: "สูตรทดสอบ NextStep",
  category: "ทดสอบ",
  ingredients: [
    {
      ingredientId: "pork-mince",
      name: "หมูสับ",
      quantity: 100,
      unit: "g",
      cost: 12,
    },
  ],
  totalCost: 12,
  suggestedPrice: 40,
  profit: 28,
  createdAt: now,
  updatedAt: now,
  status: "draft",
};

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

async function clickText(text) {
  const ok = await page.evaluate((t) => {
    const el = [...document.querySelectorAll("button, a")].find((n) =>
      (n.textContent || "").replace(/\s+/g, " ").includes(t)
    );
    if (!el) return false;
    el.click();
    return true;
  }, text);
  if (!ok) throw new Error(`click failed: ${text}`);
}

await page.goto(`${BASE}/modes`, { waitUntil: "networkidle0", timeout: 90000 });
await page.evaluate(
  (recipe) => {
    localStorage.setItem("bi.currentWorkspace.v1", "lab");
    localStorage.setItem("kl-builder-recipes", JSON.stringify([recipe]));
    localStorage.setItem("kl-builder-menus", JSON.stringify([]));
  },
  fixtureRecipe
);

await page.goto(`${BASE}/recipes/builder?id=${RECIPE_ID}`, {
  waitUntil: "networkidle0",
});
await new Promise((r) => setTimeout(r, 800));
const loaded = await page.evaluate(
  (id) => {
    const raw = localStorage.getItem("kl-builder-recipes");
    const list = raw ? JSON.parse(raw) : [];
    const nameInput = document.querySelector("input");
    return {
      stored: list.some((r) => r.id === id),
      inputValue: nameInput ? nameInput.value : null,
      bodyHasName: document.body.innerText.includes("สูตรทดสอบ"),
    };
  },
  RECIPE_ID
);
console.log("loaded", loaded);
if (!loaded.stored) throw new Error("fixture not in storage");
await shot("00-builder-loaded.png");

await clickText("บันทึกสูตร");
await new Promise((r) => setTimeout(r, 500));
await shot("01-next-step.png");
const hasDialog = await page.evaluate(
  () => Boolean(document.querySelector('[aria-label="ทำอะไรต่อ"]'))
);
if (!hasDialog) throw new Error("missing next step dialog");

await clickText("นำเข้าเมนูร้าน");
await new Promise((r) => setTimeout(r, 500));
await shot("02-import-success.png");
let text = await page.evaluate(() => document.body.innerText);
if (!text.includes("สร้างแบบร่างเมนูแล้ว") && !text.includes("แบบร่างเมนู")) {
  throw new Error("import success missing");
}

await clickText("ไปแก้ไขแบบร่างเมนู");
await new Promise((r) => setTimeout(r, 900));
await shot("03-menu-draft.png");
text = await page.evaluate(() => document.body.innerText);
if (!text.includes("ยังไม่เปิดขาย") && !text.includes("แบบร่าง")) {
  console.warn("draft copy soft-miss", text.slice(0, 300));
}
const menuUrl = page.url();

await page.goto(`${BASE}/recipes/builder?id=${RECIPE_ID}`, {
  waitUntil: "networkidle0",
});
await new Promise((r) => setTimeout(r, 500));
await shot("04-recipe-status.png");
text = await page.evaluate(() => document.body.innerText);
if (!text.includes("นำเข้าเมนูแล้ว")) throw new Error("status badge missing");

await clickText("บันทึกสูตร");
await new Promise((r) => setTimeout(r, 400));
await clickText("นำเข้าเมนูร้าน");
await new Promise((r) => setTimeout(r, 400));
await shot("05-duplicate-guard.png");
text = await page.evaluate(() => document.body.innerText);
if (!text.includes("มีเมนูที่เชื่อมอยู่แล้ว")) {
  throw new Error("duplicate guard missing");
}

const storage = await page.evaluate(() => ({
  recipes: JSON.parse(localStorage.getItem("kl-builder-recipes") || "[]"),
  menus: JSON.parse(localStorage.getItem("kl-builder-menus") || "[]"),
}));

const report = {
  base: BASE,
  menuUrl,
  recipeStatus: storage.recipes[0]?.status,
  linkedMenuId: storage.recipes[0]?.linkedMenuId,
  menuCount: storage.menus.length,
  menuActive: storage.menus[0]?.isActive,
  menuPrice: storage.menus[0]?.sellingPrice,
  ok: true,
};
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
