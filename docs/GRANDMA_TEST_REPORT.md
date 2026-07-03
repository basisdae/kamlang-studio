# Grandma Test — Restaurant Language Pass

**Goal:** A tired restaurant owner who has never used business software understands every screen immediately.

**Scope:** Copy and labels only — no logic, calculations, or data model changes.

---

## Test lens

Would a normal restaurant owner understand this without training?

| Fail pattern | Example (before) | Fix direction |
|--------------|------------------|---------------|
| Factory / ERP | แผนผลิต, ผลิตแล้ว, เป้าผลิต | แผนวันนี้, ทำแล้ว, เมนูที่จะทำ |
| Warehouse | สต๊อก, รับเข้า, หักของ | ของในครัว, เอาเข้าครัว, ตัดของ |
| Software talking | ระบบจะ…, ในระบบ, ผลลัพธ์ | Plain “จะบอกว่า…”, ในร้าน, หาไม่เจอ |
| Spreadsheet dev | ชีต, อัปโหลด, รีเฟรชหน้า | ตาราง, เลือกไฟล์, กำลังอัปเดต |
| IT backup | สำรองข้อมูล, N ส่วน | เก็บข้อมูลร้านไว้, N อย่าง |
| App workflow | แบบร่าง, กำลังผลิต, ทำสำเนา | ยังไม่เริ่ม, กำลังทำ, คัดลอก |

---

## Global terminology (after)

| Before | After |
|--------|-------|
| แผนผลิต | **แผนวันนี้** (nav, titles, search, activity) |
| วางแผนผลิต / สร้างแผนผลิต | **วางแผนวันนี้** |
| กำลังผลิต / ผลิตแล้ว | **กำลังทำ** / **ทำแล้ว** |
| แบบร่าง | **ยังไม่เริ่ม** |
| สต๊อก | **ของในครัว** |
| หักของ | **ตัดของในครัว** |
| รับเข้า | **เอาเข้าครัว** |
| ชุดบรรจุภัณฑ์ | **ของห่อกลับบ้าน** (sections) / **ของห่อกลับ** (stats) |
| ต้นทุนสูตร | **ต้นทุนทำอาหาร** |
| ทำสำเนา | **คัดลอก** |
| โหลดจาก Excel | **นำข้อมูลจาก Excel** (import title) |
| สำรองข้อมูล | **เก็บข้อมูลร้านไว้** |
| ต่อเสิร์ฟ | **ต่อจาน** (settings) |

---

## Files updated (by area)

### Central copy
- `app/copy/emptyStates.ts`
- `app/home/copy.ts`
- `app/production/copy.ts`
- `components/layout/navConfig.ts`
- `app/search/types.ts`
- `app/import/types.ts`

### Production & kitchen
- `app/production/page.tsx`, hero, status, deduct sheets/banners
- `app/production/edit/*`
- `app/today` empty states (via `emptyStates.ts`)

### Purchase & inventory
- `PurchaseReceiveSheet`, `PurchaseListItems`, `PurchaseListHeader`
- `app/inventory/page.tsx` title

### Recipes & menus
- `app/recipes/page.tsx` sections
- `app/recipes/builder/BottomSummary.tsx` — ราคาแนะนำ
- `app/recipes/utils.ts` — `formatRecipeStatus` (กำลังแก้สูตร)
- Menu builder/form/summary/cost/packaging sections

### Import & backup
- `app/import/page.tsx` and components
- `app/settings/data/*`, `backupService.ts`

### Settings & setup
- `SettingsForm.tsx` — คิดราคาขาย, ต่อจาน
- `setup/page.tsx` — เริ่มต้นใช้งาน
- `SetupForm.tsx` — GP helper
- `SetupCompleteCard.tsx`

### Notifications & activity
- `notificationService.ts`, `NotificationCard.tsx`
- `SavedProductionRepository.ts` activity messages
- `globalSearchService.ts`

---

## Intentionally kept (owner-familiar)

| Term | Why |
|------|-----|
| เป้ากำไร (%) | Common owner goal; helper explains use |
| ต้นทุน / กำไร | Normal restaurant costing words |
| วัตถุดิบ | Standard kitchen term |
| เมนูขาย | Clear distinction from สูตร |
| Excel | Owners already use it |

---

## Not changed

- Internal README / MIGRATION docs (developer-only)
- Stored recipe status value `กำลังปรับ` (display mapped to กำลังแก้สูตร)
- `knowledge/seed.ts` tips (not product UI)
- Demo `/costing` route (partially updated; not in nav)

---

## Test plan

1. **Nav** — แผนวันนี้, ของในครัว read naturally
2. **Home** — วางแผนวันนี้ / เปิดงานครัว — no “ผลิต”
3. **Production** — status ยังไม่เริ่ม → กำลังทำ → เสร็จแล้ว; deduct says ตัดของ
4. **Purchase** — เอาเข้าครัว throughout
5. **Import** — no ชีต / รีเฟรช; conflicts show names not IDs
6. **Settings** — คิดราคาขาย, เก็บข้อมูลร้านไว้
7. **Empty states** — no “ระบบ”, no “ในระบบ”

---

## Remaining polish (optional)

- Unify “นำเข้าจาก Excel” vs “โหลดจาก Excel” in older empty-state CTAs (ingredients uses นำเข้า)
- Menu detail page section titles if any still say ชุดบรรจุภัณฑ์
- Staff `/today` progress labels use `PRODUCTION_UI.progress.produced` → **ทำแล้ว** (via `copy.ts`)
