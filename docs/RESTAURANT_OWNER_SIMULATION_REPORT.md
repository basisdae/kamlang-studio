# Restaurant Owner Simulation Report

**Persona:** Restaurant owner, first time using Kamlang, no spreadsheet/ERP background.  
**Device lens:** Mobile, one hand, after closing the shop.  
**Date:** Simulation walkthrough of the six core daily tasks.

---

## Simulation journey

| # | Task | Path taken | Taps (approx.) | First-time verdict |
|---|------|------------|----------------|-------------------|
| 0 | Open app | `/` → setup banner blocks home | 0–6 | Confusing if demo data exists but setup still required |
| 1 | Create ingredient | No manual path — Excel only at `/import` | 6–10 | **Blocked** without Excel file |
| 2 | Create recipe | สูตร → สร้างสูตรใหม่ → builder | 9+ | Works if ingredients exist |
| 3 | Create menu | เพิ่มเติม → เมนูขาย → สร้างเมนูขาย | 8–10 | **Was broken** if recipe was builder-only |
| 4 | Production plan | แผนวันนี้ → วางแผนวันนี้ / edit | 8–12 | **Was broken** if menu was builder-only |
| 5 | Shopping list | ซื้อของ (auto from plan) | 1 + N ticks | Works once plan resolves |
| 6 | Review inventory | เพิ่มเติม → ของในครัว | 2–6 | Readable; update via purchase receive |

---

## Friction points

### Critical (workflow breaks)

| # | Moment | What the owner thinks | Root cause |
|---|--------|----------------------|------------|
| C1 | “I want to add กะเพรา leaves” | “Where’s the add button?” | No manual ingredient UI — Excel only |
| C2 | Saved recipe → create menu | “My recipe isn’t in the list” | Menu builder only loaded sample recipes |
| C3 | Saved menu → production plan | “My menu isn’t in the dropdown” | Production builder only loaded sample menus |
| C4 | Open `/recipes/new` | “Why am I making a menu?” | Redirect went to `/menus/new` |

### High (confusing or hidden)

| # | Moment | Owner reaction | Cause |
|---|--------|----------------|-------|
| H1 | Home before setup | “I can’t see what to do today” | Setup gate hides focus card |
| H2 | Ingredients page with demo data | “How do I add mine?” | No import link on populated list |
| H3 | Demo plan already on `/production` | “Did I already plan today?” | Seed plan uses `__TODAY__` |
| H4 | After saving recipe | “What now?” | No next-step guidance |
| H5 | `/import` | “Where is this in the app?” | Not in bottom nav |
| H6 | Sample vs yours | “Which is my data?” | เมนูตัวอย่าง / สูตรตัวอย่าง mixed with yours |

### Medium (extra taps / unclear)

| # | Moment | Issue |
|---|--------|-------|
| M1 | Purchase empty → “ไปวางแผนวันนี้” | Landed on `/production` not edit (+1 tap) |
| M2 | Production → shopping | No link to purchase list |
| M3 | Shopping list | Shows gross need — doesn’t subtract stock on hand |
| M4 | Inventory empty hint | Mentions เอาเข้าครัว but CTA is Excel only |
| M5 | Ingredient cards | Read-only — can’t tap to edit price |
| M6 | Excel import | No template download; parser errors are technical |

### Low

| # | Moment | Issue |
|---|--------|-------|
| L1 | Builder save stays on same URL | No celebratory navigation |
| L2 | “ติ๊กของที่ซื้อแล้วก่อน” | Easy to miss before เอาเข้าครัว |
| L3 | Two storage layers | Builder localStorage vs Excel user-master — invisible to owner |

---

## Confusing wording (recorded)

| Screen | Copy | Problem | Suggested |
|--------|------|---------|-----------|
| Ingredients empty | “เพิ่มรายการเมื่อพร้อม” | Implies in-app add | **Fixed** — Excel only |
| Recipe builder field | `menuName` / “ชื่อสูตร” | Internal name `menuName` | OK in UI |
| Production status | ยังไม่เริ่ม / กำลังทำ / เสร็จแล้ว | Better after Grandma pass | Monitor with staff |
| Purchase | รายการซื้อ vs ของที่ต้องซื้อ | Slight mismatch | Align labels |
| Import | ตาราง / คอลัมน์ in errors | Still technical when file wrong | Plain row messages |

---

## Extra taps (recorded)

| Flow | Extra taps | Why |
|------|------------|-----|
| Setup before daily work | +6 | Required gate |
| Import not in nav | +2 | เพิ่มเติม → find path or empty CTA |
| Purchase empty → plan | +1 | **Fixed** — now `/production/edit` |
| Production → purchase | +1 | **Fixed** — link on plan view |
| Recipe → menu | +2–3 | **Improved** — CTA after save |
| Ingredients with data → import | +0 | **Fixed** — nav row on page |

---

## UX improvements implemented

| Fix | Files | Impact |
|-----|-------|--------|
| `/recipes/new` → `/recipes/builder` | `app/recipes/new/page.tsx` | Broken links work |
| Wire builder recipes into menu picker | `app/recipes/recipeAccess.ts`, `useMenuBuilder.ts` | Your recipes appear in menu form |
| Wire builder menus into production | `app/menu/menuAccess.ts`, `useProductionBuilder.ts` | Your menus in plan dropdown |
| Rollup + costing use effective data | `productionRollupService.ts`, `menuCostService.ts` | Plans with your menus calculate |
| Ingredients page import link | `app/ingredients/page.tsx` | Discoverable add path |
| Ingredients empty copy | `emptyStates.ts` | No false promise |
| Purchase empty CTA → edit | `emptyStates.ts` | −1 tap |
| Production → purchase link | `production/page.tsx` | Clear next step |
| Recipe save → “สร้างเมนูขายต่อ” | `BottomSummary.tsx` | Guides chain |

---

## Suggested redesigns (not implemented — for review)

### P0 — Onboarding

1. **First-run chooser:** “เริ่มจาก Excel” vs “ลองด้วยตัวอย่าง” vs “เริ่มว่าง” — sets expectations about demo data.
2. **Sample data banner** on production/menus/recipes when using demo: “นี่คือตัวอย่าง — แก้หรือสร้างของคุณได้”

### P1 — Ingredient create

3. **Quick-add ingredient sheet** — name, unit, price — 3 fields, no Excel required for first recipe.
4. **Excel template download** on `/import` with one-tap sample file.

### P2 — Flow chaining

5. **After menu save** → “วางแผนวันนี้” CTA (mirror recipe → menu).
6. **After plan save** → “ดูรายการซื้อของ” CTA.
7. **Home checklist** for first week: สร้างสูตร → เมนู → แผน → ซื้อของ (progress dots).

### P3 — Shopping & inventory

8. **Purchase list net of stock** — “ต้องซื้อเพิ่ม” vs “มีพอแล้ว”.
9. **Inventory empty CTA** — split: “นำเข้าจาก Excel” + “ไปซื้อของ” when plan exists.

### P4 — Architecture (larger)

10. **Unify builder + master data** — one ingredient/recipe/menu store so Excel, builder, and production share one path (see `RESTAURANT_WORKFLOW_AUDIT.md` P0).

---

## Task-by-task scorecard (after fixes)

| Task | Understandable? | Completable UI-only? | Notes |
|------|-----------------|------------------------|-------|
| Create ingredient | ⚠️ Partial | ❌ Excel only | Link added; manual add still missing |
| Create recipe | ✅ Yes | ✅ Yes | Next step to menu added |
| Create menu | ✅ Yes | ✅ Yes | Builder recipes now in dropdown |
| Production plan | ✅ Yes | ✅ Yes | Builder menus now in dropdown |
| Shopping list | ✅ Yes | ✅ Auto | Needs saved plan |
| Review inventory | ✅ Yes | ✅ View/adjust | Stock updates via purchase |

---

## Recommended test script (owner replay)

1. Complete setup → skip or import.
2. สูตร → สร้างสูตรใหม่ → add 2 ingredients → save → **สร้างเมนูขายต่อ**.
3. Pick your recipe → set price → save.
4. แผนวันนี้ → edit → pick **your menu** → save.
5. **ดูรายการซื้อของ** → tick items → เอาเข้าครัว.
6. ของในครัว → verify quantities.

---

## Files changed in this pass

- `app/recipes/recipeAccess.ts` (new)
- `app/menu/menuAccess.ts` (new)
- `app/recipes/new/page.tsx`
- `app/ingredients/page.tsx`
- `app/recipes/builder/components/BottomSummary.tsx`
- `app/production/page.tsx`
- `app/menus/new/hooks/useMenuBuilder.ts`
- `app/menus/new/components/MenuBuilderForm.tsx`
- `app/production/edit/hooks/useProductionBuilder.ts`
- `app/lib/menuCostService.ts`
- `app/lib/productionRollupService.ts`
- `app/copy/emptyStates.ts`

Build: **passes**.
