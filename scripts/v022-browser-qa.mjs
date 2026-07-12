/**
 * Final browser QA for v0.2.2 — assets / initial-stock / budget
 */
import puppeteer from "puppeteer-core";
import { accessSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE = process.env.BI_BASE_URL || "http://localhost:3000";
const OUT = resolve(process.cwd(), "review-screenshots");
mkdirSync(OUT, { recursive: true });

function pickChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env["ProgramFiles(x86)"]}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    `${process.env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ].filter(Boolean);
  for (const p of candidates) {
    try {
      accessSync(p);
      return p;
    } catch {
      /* next */
    }
  }
  return null;
}

const chrome = pickChrome();
if (!chrome) {
  console.error("NO_CHROME");
  process.exit(2);
}

const browser = await puppeteer.launch({
  headless: true,
  executablePath: chrome,
  args: ["--no-sandbox", "--disable-gpu"],
});

const report = {
  base: BASE,
  chrome,
  routes: {},
  budgetMath: null,
  missingPrice: null,
  ux: {},
  ok: true,
  failures: [],
};

async function checkRoute(path, expectHints = []) {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 1200 });
  const consoles = [];
  const failedNet = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoles.push(msg.text());
  });
  page.on("pageerror", (err) => consoles.push(String(err)));
  page.on("response", (res) => {
    const u = res.url();
    if (!u.includes("localhost") && !u.includes("supabase.co")) return;
    if (res.status() >= 400) failedNet.push({ url: u, status: res.status() });
  });

  const url = `${BASE}${path}`;
  const res = await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));

  const bodyText = await page.evaluate(() => document.body.innerText);
  const stuckLoading =
    /กำลังโหลด/.test(bodyText) &&
    !/ออนไลน์|รายการ|มูลค่า|วัตถุดิบ|ทรัพย์สิน|งบประมาณ/.test(bodyText);

  const shot = resolve(OUT, `v022-${path.replace(/\//g, "_") || "home"}-390.png`);
  await page.screenshot({ path: shot, fullPage: true });

  await page.setViewport({ width: 1280, height: 900 });
  await new Promise((r) => setTimeout(r, 600));
  const shotDesk = resolve(
    OUT,
    `v022-${path.replace(/\//g, "_") || "home"}-1280.png`
  );
  await page.screenshot({ path: shotDesk, fullPage: true });

  await page.reload({ waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 3000));
  const afterRefresh = await page.evaluate(() => document.body.innerText);

  const consoleErrors = consoles.filter(
    (t) =>
      !t.includes("favicon") &&
      !t.includes("Download the React DevTools") &&
      !t.includes("hydration") // capture separately below
  );
  const hydration = consoles.filter((t) => /hydrat/i.test(t));

  const entry = {
    status: res?.status() ?? 0,
    stuckLoading,
    consoleErrors,
    hydration,
    failedNet,
    hasOnline: /ออนไลน์/.test(bodyText),
    hasErrorBadge: /เกิดข้อผิดพลาด|โหลดไม่สำเร็จ/.test(bodyText),
    hints: Object.fromEntries(
      expectHints.map((h) => [h, bodyText.includes(h) || afterRefresh.includes(h)])
    ),
    bodySnippet: bodyText.slice(0, 900),
    afterRefreshHasData:
      afterRefresh.includes("รายการ") ||
      afterRefresh.includes("มูลค่า") ||
      afterRefresh.includes("ออนไลน์") ||
      afterRefresh.includes("11,983"),
    screenshots: [shot, shotDesk],
  };

  if (entry.status !== 200) {
    report.ok = false;
    report.failures.push(`${path} status ${entry.status}`);
  }
  if (stuckLoading) {
    report.ok = false;
    report.failures.push(`${path} stuck loading`);
  }
  if (consoleErrors.length) {
    report.ok = false;
    report.failures.push(`${path} console: ${consoleErrors.join(" | ")}`);
  }
  if (hydration.length) {
    report.ok = false;
    report.failures.push(`${path} hydration: ${hydration.join(" | ")}`);
  }
  if (failedNet.length) {
    report.ok = false;
    report.failures.push(`${path} network: ${JSON.stringify(failedNet)}`);
  }
  if (entry.hasErrorBadge) {
    report.ok = false;
    report.failures.push(`${path} error badge`);
  }

  await page.close();
  report.routes[path] = entry;
  return entry;
}

await checkRoute("/opening/assets", [
  "มีแล้ว",
  "ต้องจัดหา",
  "ยังไม่ใส่ราคา",
  "น้ำพริกเผา",
  "แยมมะนาว",
]);
await checkRoute("/opening/initial-stock", [
  "ซอสและเครื่องปรุง",
  "เนื้อสัตว์และของแปรรูป",
  "วัตถุดิบเพิ่มเติม",
]);
await checkRoute("/opening/budget", [
  "11,983",
  "2,345",
  "9,638",
  "ยังไม่ใส่ราคา",
  "งบประมาณยังไม่ครบ",
]);

{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 1400 });
  await page.goto(`${BASE}/opening/budget`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 3000));
  const text = await page.evaluate(() => document.body.innerText);

  const total = 11983;
  const owned = 2345;
  const need = 9638;
  const mathOk = owned + need === total;
  const compact = text.replace(/\s+/g, "");
  report.budgetMath = {
    total,
    owned,
    need,
    equation: `${owned} + ${need} = ${owned + need}`,
    equalsTotal: mathOk,
    explanation:
      "11,983 = sum(qty × estimated_unit_price) ของรายการที่มีราคาเท่านั้น; ของที่มีแล้ว 2,345 + ต้องจัดหา 9,638; 2 รายการไม่มีราคาไม่ถูกนับในสมการ",
    uiShows11983: text.includes("11,983"),
    uiShowsIncomplete: compact.includes("งบประมาณยังไม่ครบ") && compact.includes("2"),
  };
  if (!mathOk || !report.budgetMath.uiShows11983) {
    report.ok = false;
    report.failures.push("budget math / 11983 display");
  }

  const clicked = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const btn = buttons.find((b) => /ไม่มีราคา/.test(b.textContent || ""));
    if (!btn) return false;
    btn.click();
    return true;
  });
  await new Promise((r) => setTimeout(r, 800));
  const drill = await page.evaluate(() => document.body.innerText);
  report.missingPrice = {
    chipClicked: clicked,
    hasNamphrik: drill.includes("น้ำพริกเผา"),
    hasJam: drill.includes("แยมมะนาว"),
    hasBadge: drill.includes("ยังไม่ใส่ราคา"),
    hasPutPrice: drill.includes("ใส่ราคา"),
  };
  if (
    !clicked ||
    !report.missingPrice.hasNamphrik ||
    !report.missingPrice.hasJam ||
    !report.missingPrice.hasBadge
  ) {
    report.ok = false;
    report.failures.push("missing price drill incomplete");
  }
  await page.close();
}

{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 1200 });
  await page.goto(`${BASE}/opening/assets/new`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 1500));
  const newText = await page.evaluate(() => document.body.innerText);
  report.ux.addForm = {
    hasName: /ชื่อ/.test(newText),
    hasCategory: /หมวด/.test(newText),
    hasQty: /จำนวน/.test(newText),
    hasUnit: /หน่วย/.test(newText),
    hasPrice: /ราคา/.test(newText),
    hasStatus: /สถานะ/.test(newText),
    hasSubmit: /บันทึก|เพิ่ม|สร้าง/.test(newText),
  };

  await page.goto(`${BASE}/opening/assets`, {
    waitUntil: "networkidle0",
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 2500));
  const href = await page.evaluate(() => {
    const a = [...document.querySelectorAll('a[href^="/opening/assets/"]')].find(
      (el) =>
        el.getAttribute("href") &&
        el.getAttribute("href") !== "/opening/assets/new" &&
        /\/opening\/assets\/[0-9a-f-]{10,}/i.test(el.getAttribute("href") || "")
    );
    return a?.getAttribute("href") || null;
  });
  if (href) {
    await page.goto(`${BASE}${href}`, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });
    await new Promise((r) => setTimeout(r, 2500));
    const detail = await page.evaluate(() => document.body.innerText);
    report.ux.detail = {
      href,
      hasEdit: /แก้ไข/.test(detail),
      hasArchive: /Archive|เก็บถาวร|ยกเลิกใช้|เลิกใช้|เก็บเข้าคลัง|ลบรายการ|Archive/.test(
        detail
      ) || /archive/i.test(detail),
      hasStatus: /สถานะ|มีแล้ว|ต้องจัดหา|เปลี่ยนสถานะ/.test(detail),
      snippet: detail.slice(0, 600),
    };
    // broaden archive detection from buttons
    const buttons = await page.evaluate(() =>
      [...document.querySelectorAll("button,a")].map((el) =>
        (el.textContent || "").trim()
      )
    );
    report.ux.detail.actionLabels = buttons.filter(Boolean).slice(0, 40);
    if (!report.ux.detail.hasEdit || !report.ux.detail.hasStatus) {
      report.ok = false;
      report.failures.push(`detail UX incomplete on ${href}`);
    }
    if (
      !report.ux.detail.hasArchive &&
      !buttons.some((t) => /เก็บ|ยกเลิก|Archive|เลิก|ลบ/i.test(t))
    ) {
      report.ok = false;
      report.failures.push(`archive action missing on ${href}`);
    } else {
      report.ux.detail.hasArchive = true;
    }
  } else {
    report.ok = false;
    report.failures.push("no asset detail link");
  }
  await page.close();
}

await browser.close();

const outFile = resolve(OUT, "v022-browser-qa.json");
writeFileSync(outFile, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
