# Restaurant Workflow Audit Report

**Audit date:** July 2026  
**Lens:** Natural restaurant chain — Ingredient → Recipe → Menu → Production → Purchase → Inventory → Today's Work  
**Rules:** Audit and suggestions only — no code changes in this pass

---

## Executive summary

| Verdict | Detail |
|---------|--------|
| **Daily ops loop** | **Mostly natural** — Production → Purchase → Receive → Inventory → Kitchen (`/today`) is wired with clear empty states and home guidance |
| **Build loop** | **Broken in the UI** — Builder-saved recipes and menus do not flow into production; only seed + Excel-imported master data completes the chain |
| **Navigation** | **Ops-first, not build-first** — matches a tired owner closing shift, but hides the setup chain under “More” |

The app supports **two parallel data paths** that the UI does not explain:

```
Path A — Master data (works end-to-end)
  Import Excel → Ingredient / Recipe / Menu repos → Production → Purchase → Inventory

Path B — Builder drafts (breaks mid-chain)
  Recipe Builder → SavedRecipe (local) → ✗ Menu Builder (standard recipes only)
  Menu Builder → SavedMenu (local) → ✗ Production Builder (seed menus only)
```

---

## Ideal workflow (reference)

```mermaid
flowchart LR
  A[วัตถุดิบ] --> B[สูตร]
  B --> C[เมนูขาย]
  C --> D[แผนผลิต]
  D --> E[ซื้อของ]
  E --> F[สต๊อก]
  F --> G[งานครัววันนี้]
```

**Two rhythms:**

1. **Setup (occasional):** วัตถุดิบ → สูตร → เมนูขาย  
2. **Daily (every service):** แผนผลิต → ซื้อของ → เอาเข้าครัว → ทำในครัว → หักของเมื่อเสร็จ

---

## Stage-by-stage assessment

### 1. Ingredient (วัตถุดิบ)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ⚠️ | Buried in **More** nav; not in primary bar |
| Add data | ✅ Import Excel | Empty state → `/import` |
| In-app add | ❌ | Page is read-only catalog (price + unit) |
| → Recipe | ⚠️ | Recipe builder reads `IngredientRepository`; no forward link from ingredients list |
| → Inventory | ⚠️ | Stock lives on `/inventory`; link from ingredients was removed in noise pass |

**Feels natural for:** browsing prices  
**Breaks workflow for:** first-time owner who expects “add ingredient here”

**Suggestions**
- Empty/non-empty ingredients: one line → “โหลดจาก Excel” or “ดูสต๊อก”
- Setup complete card: offer **both** “โหลดจาก Excel” and “สร้างสูตรแรก” (not import-only)
- Consider import-first copy on ingredients: “เริ่มจากไฟล์ Excel หรือใช้ตัวอย่างในระบบ”

---

### 2. Recipe (สูตร)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ✅ | Primary nav “สูตร” + CTA “สร้างสูตรใหม่” |
| Builder UX | ✅ | Ingredients from repo, live cost, save draft |
| After save | ❌ | Stays on builder; **no “สร้างเมนูขายต่อ”** |
| → Menu | **❌ Critical** | Menu builder `getAllRecipes()` = **standard/sample only** — saved drafts invisible |
| `/recipes/new` | **❌** | Redirects to `/menus/new` — **skips recipe step** |

**Feels natural for:** experimenting with cost on sample ingredients  
**Breaks workflow for:** owner who saves a recipe and expects to sell it

**Suggestions (high priority)**
1. **Fix `/recipes/new`** → redirect to `/recipes/builder` (not menus)
2. After recipe save: secondary CTA **“สร้างเมนูขาย”** → `/menus/new` with recipe pre-selected when possible
3. **Unify menu builder recipe list:** standard recipes + saved drafts (or promote saved recipe to master on save)
4. Recipes list: after “สูตรที่ยังไม่เสร็จ”, hint **“ต้องผูกเมนูขายก่อนใช้ในแผนผลิต”**

---

### 3. Menu (เมนูขาย)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ⚠️ | Under **More** nav (not primary) |
| Builder | ✅ | Recipe + packaging + price; live cost preview |
| After save | ⚠️ | Returns to `/menus` list — **not production** |
| → Production | **❌ Critical** | Production builder `getAllMenus()` = **seed menus only** — saved menus excluded |
| → Recipe | ✅ | Menu detail links to recipe |

**Feels natural for:** creating a priced menu from **sample** recipes  
**Breaks workflow for:** owner’s own saved menus in production plan

**Suggestions (high priority)**
1. **Production builder menu picker:** include `getAllSavedMenus()` (same as menus list page)
2. **Production rollup:** resolve menu via `getMenuById` **or** `getSavedMenuById` + `savedMenuToMenu`
3. After menu save: optional **“ใส่ในแผนวันนี้”** → `/production/edit` with menu pre-filled
4. Menus list empty state already good; add success path on save → “ไปวางแผนผลิต”

---

### 4. Production (แผนผลิต)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ✅ | Primary nav + home next step when no plan |
| Builder | ✅ | Date, menus, quantities; bottom summary |
| → Purchase | ✅ | Rollup drives purchase list automatically |
| → Today | ✅ | Home `HomeStaffViewLink` when plan exists |
| → Inventory | ✅ | “เสร็จแล้ว” triggers deduct confirm |
| Label | ⚠️ | Form still says **“เป้าผลิต (เมนูขาย)”** — jargon from prior audits |

**Feels natural for:** daily planning with **demo/seed** menus  
**Breaks workflow for:** plans using **saved** menus only

**Suggestions**
- Rename builder label → **“เมนูที่จะทำวันนี้”** (align with section title)
- Empty plan CTA already → edit; add hint if user has saved menus but picker shows only samples
- When plan saved → home could say **“เปิดงานครัว”** linking `/today` (not only production)

---

### 5. Purchase (ซื้อของ)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ✅ | Primary nav + home when items remain |
| Depends on | ✅ | Production plan required — empty → `/production` |
| Tick flow | ✅ | Check bought items |
| → Inventory | ⚠️ | **Receive (“เอาเข้าครัว”) is easy to skip** |
| Home guidance | ⚠️ | Next step tracks **bought**, not **received** |

**Feels natural for:** shopping list from today’s plan  
**Breaks workflow for:** owner who ticks all bought but never receives — stock unchanged, home shows “พร้อมเปิดร้าน”

**Suggestions**
- Home next step: if all bought but unchecked receive → **“เอาเข้าครัว”** → `/purchase`
- Notification type: `purchase_not_received` when bought > received
- Keep receive bar helper (already minimal after noise pass)

---

### 6. Inventory (สต๊อก)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ⚠️ | More nav; home when low/out |
| From purchase | ✅ | Receive updates stock |
| From production | ✅ | Complete plan deducts stock |
| Manual adjust | ✅ | Tap card → adjust sheet |
| → Today | ⚠️ | Indirect — staff uses prep checklist, not stock page |

**Feels natural for:** checking alerts and fixing quantities  
**Breaks workflow for:** owner expecting inventory to be “step before kitchen” in UI order — app treats it as **supporting** ops, not a daily step

**Suggestions**
- Low stock on home is correct; no need to force inventory visit when healthy
- After receive success: short toast **“สต๊อกอัปเดตแล้ว”** with link to inventory (optional)

---

### 7. Today's Work (งานครัววันนี้ — `/today`)

| Aspect | Status | Notes |
|--------|--------|-------|
| Entry | ⚠️ | **Not in nav** — only home “เปิดงานครัววันนี้” |
| Content | ✅ | Menu / ingredient / packaging prep checklists from plan |
| Depends on | ✅ | Production plan — empty → owner should plan |
| Owner path | ⚠️ | Home “พร้อมเปิดร้าน” → `/production`, not `/today` |

**Feels natural for:** staff kitchen mode  
**Breaks workflow for:** owner who doesn’t discover `/today` without home link

**Suggestions**
- When home ready + plan exists: next step could alternate **“เปิดงานครัว”** → `/today` (owner can preview prep)
- Optional: Today in More nav for staff devices
- Keep packaging section hidden when empty (already done)

---

## Cross-cutting: Home orchestration

`getHomeNextStep` priority:

1. No plan → Production  
2. Purchase incomplete → Purchase  
3. Stock alerts → Inventory  
4. Else → “พร้อมเปิดร้าน” → Production  

| Good | Gap |
|------|-----|
| Single calm next action | Never prompts **receive** or **today** |
| Matches closing-shift ops | Skips **build chain** entirely (no “สร้างเมนู” when library empty) |

**Suggestions**
- Add receive step between bought-all and ready
- First-time: if no saved menus + no plan → suggest **สร้างเมนูขาย** or **โหลดจาก Excel** (not only production)

---

## Cross-cutting: Navigation vs workflow

| Nav slot | Route | Workflow role |
|----------|-------|---------------|
| Primary | `/production` | Daily — correct |
| Primary | `/purchase` | Daily — correct |
| Primary | `/recipes` | Build — mid-chain |
| More | `/menus` | Build — should be nearer recipe |
| More | `/ingredients` | Build start — too hidden |
| More | `/inventory` | Ops support |
| Missing | `/today` | End of daily chain |

**Verdict:** Navigation optimizes **daily ops**, not **Ingredient → Recipe → Menu** setup. Acceptable for product philosophy if build path is fixed and discoverable via home/setup.

---

## What already feels natural ✅

1. **Production → Purchase** — automatic list from rollup; empty states cross-link  
2. **Purchase → Inventory** — tick + receive pattern (when user completes it)  
3. **Production → Today** — same plan powers staff checklists  
4. **Production complete → Inventory deduct** — confirm sheet, shortage blocking  
5. **Excel import** — full chain ingredients → recipes → menus → usable in production  
6. **Menu detail ↔ Recipe** — bidirectional context  
7. **Purchase ↔ Production** — “ดูแผนผลิต” link  
8. **Empty states** — generally point to the correct previous step  

---

## Priority fix list

### P0 — Workflow breaks (data path)

| # | Issue | Suggested fix |
|---|-------|---------------|
| 1 | Saved menus invisible in production builder | Merge saved + seed menus in picker; rollup resolves both |
| 2 | Saved recipes invisible in menu builder | Include saved drafts or promote on save to master |
| 3 | `/recipes/new` → `/menus/new` | Redirect to `/recipes/builder` |

### P1 — Forward momentum (copy + CTA only)

| # | Issue | Suggested fix |
|---|-------|---------------|
| 4 | Recipe save dead-end | “สร้างเมนูขายต่อ” after save |
| 5 | Menu save → list only | “ใส่ในแผนวันนี้” after save |
| 6 | Bought but not received | Home step + notification for receive |
| 7 | Ready state ignores kitchen | “เปิดงานครัว” on home when plan exists |

### P2 — Discoverability

| # | Issue | Suggested fix |
|---|-------|---------------|
| 8 | Ingredients entry hidden | Link from setup / recipe builder / import success |
| 9 | `/today` not in nav | Add to More or staff shortcut |
| 10 | Two data paths unexplained | One-line banner on builder: “แบบร่าง — ต้องเป็นเมนูขายก่อนใช้ในแผนผลิต” |

### P3 — Polish

| # | Issue | Suggested fix |
|---|-------|---------------|
| 11 | Production form label jargon | “เมนูที่จะทำวันนี้” |
| 12 | Setup complete import-only | Add “สร้างสูตรแรก” path |

---

## Review checklist

Walk these paths on device:

### Path A — Excel (should work today)
1. `/import` → ingredients → recipes → menus  
2. `/production/edit` → pick imported menu → save  
3. `/purchase` → tick → **เอาเข้าครัว**  
4. `/today` → prep checklists  
5. `/production` → เสร็จแล้ว → confirm deduct  

### Path B — Builder (expect breaks)
1. `/recipes/builder` → save draft  
2. `/menus/new` → **saved recipe not in list** ❌  
3. `/menus/new` → save → `/production/edit` → **saved menu not in list** ❌  

### Path C — Daily ops (demo data)
1. `/` → next step through plan / buy / stock  
2. Confirm home never nudges **receive** or **today**  

---

## Conclusion

The **daily restaurant loop** (plan → buy → stock → kitchen → deduct) is thoughtfully connected and feels natural for an owner using **imported or sample master data**.

The **creation loop** (ingredient → recipe → menu → production) **breaks in the builder UI** because saved drafts and master repositories are not bridged. Until P0 is fixed, the honest owner path is **Excel import**, not tap-through builders.

No code changes in this pass — **stopped for review**.

---

*Related: `docs/GLOSSARY.md`, `app/recipes/README.md`, `docs/UI_NOISE_REPORT.md`*
