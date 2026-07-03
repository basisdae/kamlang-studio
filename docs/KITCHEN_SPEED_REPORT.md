# Kitchen Speed Report

**Audit date:** July 2026  
**Scope:** Tap count from page open → task complete  
**Rules:** No new features — navigation, link targets, CTA consolidation, and flow wiring only

---

## How we count taps

| Counted | Not counted |
|---------|-------------|
| Bottom nav, More menu, links, buttons | Typing in text fields |
| Checkboxes (purchase, staff prep) | Native OS file picker |
| Sheet open + confirm/cancel | Scrolling |
| Ingredient row pick in popup | `<select>` changes (still required, noted) |

**More-menu tax:** Routes only in `moreNavItems` (`/menus`, `/ingredients`, `/inventory`, `/search`, `/settings`) cost **+1 tap** vs primary nav (`/`, `/production`, `/purchase`, `/recipes`).

---

## Global friction

| Issue | Where | Extra taps |
|-------|-------|------------|
| Home “วางแผน” → `/production`, not edit | `getHomeNextStep.ts` | **+1** before creating a plan |
| Production notification → `/production` | `notificationService.ts` | **+1** |
| Purchase / production empty states → `/production` | `emptyStates.ts`, purchase page | **+1** |
| Menus only in More menu | `navConfig.ts` | **+1** vs primary modules |
| Menu edit: list → detail → edit | `MenuLibraryCard`, `MenuActionBar` | **+1** vs direct edit |
| Recipe save stays on builder | `useRecipeBuilder.ts` | **+1** back to list (vs production/menu save) |
| Import / backup `backHref="/"` | `import/page.tsx`, `settings/data/page.tsx` | **+1** returning to settings |
| Duplicate “สร้างเมนูขาย” on Recipes page | `recipes/page.tsx` | Detour risk, not always extra tap |

---

## Recipe Builder

### Create new recipe (1 ingredient, save)

| Step | Action |
|------|--------|
| 1 | Bottom nav **สูตร** → `/recipes` |
| 2 | **สร้างสูตรใหม่** → `/recipes/builder` |
| 3 | **เพิ่มวัตถุดิบ** → `IngredientPopup` |
| 4 | Tap ingredient row |
| 5 | **เพิ่ม** (popup stays open) |
| 6 | **บันทึกสูตร** (`BottomSummary`) |

| Entry | Current taps | Suggested taps | Improvement |
|-------|-------------|----------------|-------------|
| Home → nav → create → 1 ingredient → save | **6** | **5** | After save, offer **กลับรายการสูตร** or auto-navigate to `/recipes` (−1 back tap) |
| `/recipes` → create → 1 ingredient → save | **5** | **4** | Same post-save navigation |
| Deep link `/recipes/builder` | **3** | **3** | Already optimal entry |

**Suggestions (no new features)**

1. **Post-save navigation** — Match `useProductionBuilder` / `useMenuBuilder`: `router.push("/recipes")` after first save, or a one-tap link in `BottomSummary`.
2. **Remove “สร้างเมนูขาย”** from `RecipesPage` — keep only on `MenusPage` (reduces wrong-module detours).
3. **Resume path** — `SavedRecipeLibraryCard` → builder is already **1 tap**; keep prominent.

**Add each extra ingredient:** +2 taps (pick row + เพิ่ม). Popup staying open is good — no change needed.

---

## Production

### Create today’s plan (1 menu line, save)

| Step | Action |
|------|--------|
| 1 | Home **วางแผน** → `/production` |
| 2 | `EmptyState` **สร้างแผนผลิต** → `/production/edit?date=…` |
| 3 | **เพิ่มเมนูขาย** (`ProductionBuilderForm`) |
| 4 | Select menu + quantity (fields) |
| 5 | **บันทึกแผนผลิต** → auto `/production` |

| Entry | Current taps | Suggested taps | Improvement |
|-------|-------------|----------------|-------------|
| Home → create plan (1 line) | **4** | **3** | Home + notification `href` → `/production/edit?date={today}` (−1) |
| Nav **แผนผลิต** → create (1 line) | **3** | **2** | EmptyState already deep-links; drop intermediate view optional |
| Nav → edit existing plan | **2** | **2** | OK |

### Mark plan complete + deduct stock

| Step | Action |
|------|--------|
| 1 | **เสร็จแล้ว** (`ProductionStatusControl`) |
| 2 | **ยืนยันหักของ** (`ProductionDeductConfirmSheet`) |

| Task | Current | Suggested | Improvement |
|------|---------|-----------|-------------|
| Complete + deduct | **2** | **2** | Confirm is required for stock safety — keep |
| Status draft ↔ preparing | **1** | **1** | OK |

### When plan exists, home shows “พร้อมเปิดร้าน”

| Entry | Current | Suggested | Improvement |
|-------|---------|-----------|-------------|
| Home ready state | **1** → `/production` summary | **1** → `/today` staff checklist | Staff prep is the next action; production summary is review-only |

**Suggestions**

1. **`getHomeNextStep` + `production_missing` notification** → `/production/edit?date={today}` when no plan.
2. **Ready state** → `/today` when plan exists and purchase is done.
3. **Merge edit CTAs** on `/production` — hero + link card both mean “แก้ไข”; one tappable surface is enough (clarity, not always −1 tap).

---

## Purchase

### Mark N items bought + receive into kitchen

| Step | Action |
|------|--------|
| 1 | Nav **ซื้อของ** or Home next step |
| 2–(N+1) | Checkbox per line (`PurchaseListItems`) |
| N+2 | **เอาเข้าครัว (N)** (`PurchaseReceiveBar`) |
| N+3 | **ยืนยันเอาเข้าครัว** (`PurchaseReceiveSheet`) |

| Task | Current | Suggested | Improvement |
|------|---------|-----------|-------------|
| 1 item: buy + receive | **1 + 1 + 1 + 1 = 4** | **3** | Auto-open receive sheet when last unchecked item is ticked (−1) |
| 5 items: buy + receive | **1 + 5 + 1 + 1 = 8** | **7** | Same auto-open (−1) |
| No plan (empty) | **1** → `/production` then +2 to edit | **1** → `/production/edit?date=…` | EmptyState direct edit (−2 total from empty purchase) |

**Suggestions**

1. **Auto-open `PurchaseReceiveSheet`** when all lines become checked (user still confirms inside sheet).
2. **Empty state** → `/production/edit?date={today}` not `/production`.
3. Checkbox + receive stay separate — combining would be a feature change; out of scope.

---

## Inventory

### Adjust stock for one item

| Step | Action |
|------|--------|
| 1 | Home stock alert **or** More → **สต๊อก** |
| 2 | (Optional) **ใกล้หมด** filter |
| 3 | Tap `InventoryCard` → `InventoryAdjustSheet` |
| 4 | **บันทึก** |

| Entry | Current | Suggested | Improvement |
|-------|-------------|----------------|-------------|
| Home stock alert → adjust 1 item | **1 + 1 + 1 = 3** | **2** | Pre-apply low/out filter when arriving from home/notifications (−1) |
| More → inventory → adjust | **2 + 1 + 1 = 4** | **3** | Same filter deep link |
| Notification → inventory → adjust | **2 + 1 + 1 = 4** | **3** | Notification `href` → `/inventory?filter=low` (or `out`) |

**Suggestions**

1. **`getHomeNextStep` stock branch** — append filter query or set initial filter in `inventory/page.tsx` from `searchParams`.
2. **`notificationService.ts`** — low/out hrefs include filter param.

---

## Menus

### Create new menu (save)

| Step | Action |
|------|--------|
| 1–2 | More → **เมนูขาย** |
| 3 | **สร้างเมนูขาย** → `/menus/new` |
| 4 | Fill form (fields) |
| 5 | **บันทึกเมนูขาย** → `/menus` |

| Entry | Current | Suggested | Improvement |
|-------|-------------|----------------|-------------|
| More → create → save | **4** | **3** | Promote **เมนูขาย** to primary nav **or** home shortcut when user has recipes but no menus (−1) |
| Recipes page detour → create | **4** | **3** | Remove duplicate CTA; use menus entry only |

### Edit saved menu

| Step | Action |
|------|--------|
| 1–2 | More → **เมนูขาย** |
| 3 | `MenuLibraryCard` → `/menus/[id]` |
| 4 | **แก้ไขเมนูขาย** (`MenuActionBar`) |
| 5 | **บันทึกการแก้ไข** → `/menus/[id]` |

| Entry | Current | Suggested | Improvement |
|-------|-------------|----------------|-------------|
| More → edit saved menu | **5** | **4** | **แก้ไข** on list card for saved menus → skip detail hop (−1) |
| Detail → packaging empty CTA | **3** from detail | **2** | Already has edit link when packaging missing — good |

**Suggestions**

1. **List-card edit affordance** for saved menus only (secondary button or long-press → `/menus/[id]/edit`).
2. **New menu save** → `/menus/{id}` like edit flow (user sees result without finding card again).
3. **Nav promotion** — Menus is high-frequency; consider swapping with a lower-use primary tab (nav config only).

---

## Settings

### Update settings (returning user)

| Step | Action |
|------|--------|
| 1–2 | More → **ตั้งค่า** |
| 3 | **บันทึกการตั้งค่า** |

| Task | Current | Suggested | Improvement |
|------|---------|-----------|-------------|
| Open settings → save | **3** | **3** | OK for rare task |

### First-time setup

| Step | Action |
|------|--------|
| 1 | Home `HomeSetupBanner` → `/setup` |
| 2 | **บันทึกการตั้งค่า** |

| Task | Current | Suggested | Improvement |
|------|---------|-----------|-------------|
| Setup complete | **2** | **2** | OK |

### Backup export

| Step | Action |
|------|--------|
| 1–2 | More → **ตั้งค่า** |
| 3 | **ไปสำรองข้อมูล** |
| 4 | **ดาวน์โหลดไฟล์สำรอง** |

| Entry | Current | Suggested | Improvement |
|-------|-------------|----------------|-------------|
| Settings → export | **4** | **3** | Notification → `/settings/data` already skips settings (−1 from notif path) |
| Notification → export | **2** | **2** | OK |

### Restore backup

| Step | Action |
|------|--------|
| 1–3 | Reach `/settings/data` |
| 4 | File picker (OS) |
| 5 | **ยืนยันเอากลับ** |

| Task | Current | Suggested | Improvement |
|------|---------|-----------|-------------|
| Restore | **3 nav + confirm** | **2 nav** returning | `backHref="/settings"` on data + import pages (−1 when returning) |

### Excel import

| Step | Action |
|------|--------|
| 1 | Reach `/import` (setup card, empty state, or URL) |
| 2 | (Optional) type tile |
| 3 | File picker |
| 4 | **บันทึกลงร้าน** |
| 5–6 | (If conflicts) resolution + confirm |

| Entry | Current | Suggested | Improvement |
|-------|-------------|----------------|-------------|
| Settings → import | **No link** (must know URL) | **+1 row** on `SettingsPage` | Same as backup card — not a feature, wiring |
| Import → back | **1** to home | **1** to settings | Fix `backHref` |

---

## Daily morning flow (combined)

Typical owner sequence: **plan → purchase → receive → production status**

| Phase | Current taps (nav only) | After suggested wiring |
|-------|-------------------------|-------------------------|
| Create plan from home | 4 | **3** |
| Buy 5 items + receive | 8 | **7** |
| Mark preparing | 1 | 1 |
| Complete + deduct | 2 | 2 |
| **Total navigation** | **15** | **13** |

Field work (quantities, menu picks) unchanged.

---

## Priority ranking

| P | Change | Files | Saves |
|---|--------|-------|-------|
| **1** | Home + notifications → `/production/edit?date={today}` when no plan | `getHomeNextStep.ts`, `notificationService.ts`, `emptyStates.ts` | **1–2** / morning |
| **2** | Purchase empty + production empty → direct edit URL | `emptyStates.ts`, `purchase/page.tsx` | **1–2** |
| **3** | Auto-open receive sheet when all items checked | `purchase/page.tsx` | **1** / shopping trip |
| **4** | Inventory links with `filter=low` / `out` | `getHomeNextStep.ts`, `notificationService.ts`, `inventory/page.tsx` | **1** / stock alert |
| **5** | Menu list → direct edit for saved menus | `MenuLibraryCard.tsx` | **1** / edit |
| **6** | Recipe save → return to `/recipes` | `useRecipeBuilder.ts` or `BottomSummary.tsx` | **1** / recipe |
| **7** | `backHref="/settings"` on import + data | `import/page.tsx`, `settings/data/page.tsx` | **1** / return path |
| **8** | Ready home state → `/today` | `getHomeNextStep.ts` | **0–1** (better target) |
| **9** | Remove menu CTA from recipes page | `recipes/page.tsx` | Clarity |
| **10** | Promote menus in nav or home shortcut | `navConfig.ts` or home | **1** / menu tasks |

---

## Out of scope (would be new features)

- Swipe-to-buy-and-receive on purchase lines  
- Auto-deduct without confirm sheet  
- Inline recipe editing on library cards  
- New modules or automation  

---

## Next step

Review priority list. Confirm which items to implement in **Kitchen Speed V1** (recommended: P1–P4 only — highest daily impact, smallest diff).
