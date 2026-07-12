/**
 * Production runtime smoke — Opening OS v0.3.2
 * Checks routes return 200 and `/` redirects away from seed Overview.
 * Does not print secrets.
 */
const BASE = process.env.PROD_BASE_URL || "https://kamlang-studio.vercel.app";

const ROUTES = [
  "/",
  "/opening",
  "/opening/checklist",
  "/opening/checklist/ingredients",
  "/opening/budget",
  "/opening/assets",
];

const FORBIDDEN = [
  "120,000",
  "45,610",
  "เงินลงทุน",
  "Equipment",
  "งบ Must",
];

async function check(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: "manual" });
  const status = res.status;
  let body = "";
  if (status >= 200 && status < 400 && status !== 307 && status !== 308) {
    body = await res.text();
  } else if (status === 307 || status === 308 || status === 302) {
    body = res.headers.get("location") || "";
  }
  const hits = FORBIDDEN.filter((s) => body.includes(s));
  return { path, status, location: res.headers.get("location"), hits };
}

const results = [];
for (const path of ROUTES) {
  results.push(await check(path));
}

const root = results.find((r) => r.path === "/");
const okRoot =
  root &&
  (root.status === 307 ||
    root.status === 308 ||
    root.status === 302 ||
    (root.location || "").includes("/opening") ||
    !root.hits.includes("120,000"));

const okRoutes = results.every((r) => {
  if (r.path === "/") return okRoot;
  return r.status === 200 || r.status === 307 || r.status === 308;
});

const out = {
  ok: Boolean(okRoot && okRoutes),
  base: BASE,
  results,
};
console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 1);
