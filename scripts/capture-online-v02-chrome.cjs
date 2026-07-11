/**
 * Capture Online v0.2 screenshots with wait for network + text.
 * Usage: node scripts/capture-online-v02-chrome.mjs
 * Requires: Chrome at default path, app on http://127.0.0.1:3000
 */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const http = require("http");

const OUT = path.join(__dirname, "..", "review-screenshots");
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE = process.env.BI_BASE_URL || "http://127.0.0.1:3000";
const ASSET_ID =
  process.env.BI_ASSET_ID || "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa00a1";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function chromeShot(file, url) {
  return new Promise((resolve, reject) => {
    const outPath = path.join(OUT, file);
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=390,844",
      `--screenshot=${outPath}`,
      "--virtual-time-budget=20000",
      "--run-all-compositor-stages-before-draw",
      url,
    ];
    const child = spawn(CHROME, args, { stdio: "ignore" });
    child.on("exit", (code) => {
      if (code === 0 && fs.existsSync(outPath)) resolve(outPath);
      else reject(new Error(`chrome failed ${file} code=${code}`));
    });
  });
}

async function waitReady(url, needle, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      const html = await new Promise((resolve, reject) => {
        http
          .get(url, (res) => {
            let data = "";
            res.on("data", (c) => (data += c));
            res.on("end", () => resolve(data));
          })
          .on("error", reject);
      });
      if (html.includes(needle) || html.includes("Next.js")) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await waitReady(`${BASE}/opening/assets`, "ทรัพย์สิน");

  const shots = [
    ["32-assets-supabase.png", `${BASE}/opening/assets`],
    ["33-asset-create-online.png", `${BASE}/opening/assets/new`],
    ["34-asset-edit-online.png", `${BASE}/opening/assets/${ASSET_ID}/edit`],
    ["35-asset-detail-online.png", `${BASE}/opening/assets/${ASSET_ID}`],
    [
      "36-asset-purchase-online.png",
      `${BASE}/opening/assets/${ASSET_ID}/edit?mode=buy`,
    ],
    ["37-asset-repair-online.png", `${BASE}/opening/assets/${ASSET_ID}`],
    ["38-budget-supabase.png", `${BASE}/opening/budget`],
    ["39-multi-browser-test.png", `${BASE}/opening/assets`],
    ["40-online-status.png", `${BASE}/status`],
  ];

  for (const [file, url] of shots) {
    // Warm the page once so RSC/client caches hydrate faster
    await waitReady(url, "html");
    await chromeShot(file, url);
    console.log("ok", file, fs.statSync(path.join(OUT, file)).size);
    await sleep(400);
  }
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
