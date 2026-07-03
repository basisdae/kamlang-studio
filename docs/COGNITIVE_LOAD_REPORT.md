# Cognitive Load Report

**Audit date:** July 2026  
**Lens:** AGENTS.md — tired owner after closing, mobile-first, *"Will this help work faster and feel less stressed?"*  
**Scope:** Thinking burden, not taps. Copy, layout, and option pruning only — no new features.

---

## Audit question (every screen)

> **What does the user need to think about?**  
> Can they answer **"What should I do next?"** within one second?

**Counted as cognitive load:** duplicate facts, competing CTAs, ghost/disabled buttons, jargon, wrong labels, orphan pages, two-step flows without explanation, sample vs own data ambiguity.

---

## Cross-cutting themes

| Theme | Where | Why it hurts thinking |
|-------|-------|------------------------|
| **Naming triangle** | Nav *วัตถุดิบ* / *สต๊อก*, search *ของในครัว* | Three names for related things — user must map concepts |
| **Ghost CTAs** | Sample recipe/menu detail bars | Disabled buttons look actionable; brain tries them anyway |
| **Sample vs own** | Recipes, menus libraries | Two list types without clear “yours vs example” |
| **Status repeated** | `/production` hero + badges + status control | Same fact in 3 places — which is “truth”? |
| **Buy ≠ stock** | `/purchase` checkbox vs receive | Tick feels “done” but kitchen stock unchanged |
| **English in Thai UI** | Import sheet names, builder units | Dev vocabulary on tired shift |
| **Orphan routes** | `/costing`, `/activity`, `/recipes/new` | Dead ends or demo pages without context |
| **Staff path hidden** | `HomeStaffViewLink` not rendered | Kitchen role has no mental model for entry |

---

## Page-by-page findings

### `/` — Home (`HomeTodayPage`)

**User intent:** One clear next action for today.

**What they think about:** Setup vs notifications vs hero vs next step — which matters first?

| Element | Issue | Severity |
|---------|-------|----------|
| `HomeSetupBanner` + `HomeNotificationBadge` + `HomeHero` + `HomeNextStep` | Up to 4 focal areas when setup incomplete + notifications | **Medium** |
| `HomeHero` *วันนี้ต้องผลิต X จาน* + `HomeNextStep` hint (ready path) | Duplicate quantity when purchase complete | **Low** |
| `HomeStaffViewLink` | Component exists, **not rendered** — staff entry undiscoverable | **High** |
| `AppShell` `title=""` `hidePageHeader` | No page label for orientation | **Low** |

**Next step in 1s?** **Yes** when setup complete — `HomeNextStep` (*ทำต่อ*) is strong.

**Suggested fixes:** When setup incomplete, suppress notification badge or merge into banner. When ready, shorten hero hint to action-only. Render `HomeStaffViewLink` when plan exists.

---

### `/production` — Production (`ProductionPage`)

**User intent:** See today’s plan, update progress, edit if needed.

**What they think about:** Status meaning, deduct side-effect, where to tap first on a long page.

| Element | Issue | Severity |
|---------|-------|----------|
| `ProductionHero` stat *ขั้นตอน* + `ProductionTodayHeader` badges + `ProductionStatusControl` | Status shown **3×** | **High** |
| *เสร็จแล้ว* in `ProductionStatusControl` | Triggers deduct sheet — user must infer stock impact | **High** |
| Link *แก้ไขแผนผลิต* + scroll + `ProductionActionBar` | No single obvious primary action | **Medium** |
| *แผนผลิต* / *แผนผลิตวันนี้* / *เป้าผลิตวันนี้* | Near-synonym stack | **Medium** |
| `ProductionIngredientTotals` vs `/today` checklists | Same prep lists, different screens — role confusion | **Low** |

**Next step in 1s?** **Partial** — empty state clear; with plan, user scans for edit vs status.

**Suggested fixes:** Drop badges from `ProductionTodayHeader` when status control visible. Helper under *เสร็จแล้ว*: *"จะหักของในครัวตามแผน"*. Section title *เมนูที่ต้องทำ* instead of *เป้าผลิตวันนี้*. Link to `/today` for kitchen.

---

### `/production/edit` — Plan builder (`ProductionEditPageContent`)

**User intent:** Pick menus + quantities → see cost → save.

**What they think about:** Date choice, jargon *เป้าผลิต (เมนูขาย)*, preview sections before save.

| Element | Issue | Severity |
|---------|-------|----------|
| *เป้าผลิต (เมนูขาย)* | Two concepts in one label | **Medium** |
| *วันที่ผลิต* date field | Extra decision for “today” default workflow | **Medium** |
| `ProductionCostSummary` + ingredient + packaging blocks on edit | Duplicates post-save `/production` view | **Medium** |
| `VersionHistoryPanel` on first create | *ดูประวัติ* before anything saved | **Low** |
| AppShell description lists 3 tasks | *กำหนดวันที่ เป้าผลิต และจำนวนที่ต้องทำ* | **Low** |

**Next step in 1s?** **Yes** — *เพิ่มเมนูขาย* + bottom save bar.

**Suggested fixes:** Label *เมนูที่จะทำวันนี้*. Description *เลือกเมนู ใส่จำนวน แล้วบันทึก*. Collapse preview into bottom summary or one `<details>`.

**Flow fit:** Best match for Create → Add → Quantity → Result → Save.

---

### `/purchase` — Purchase (`PurchasePage`)

**User intent:** Mark bought items; get stock into kitchen.

**What they think about:** “Is ticking enough?” (No — receive is separate.)

| Element | Issue | Severity |
|---------|-------|----------|
| Checkbox *ซื้อแล้ว* vs `PurchaseReceiveBar` *เอาเข้าครัว* | **Two-step model unexplained** — highest daily confusion | **High** |
| AppShell *ติ๊กของที่ซื้อแล้ว* | Omits receive step entirely | **High** |
| `PurchaseHero` *ซื้อแล้ว X/Y* + stats *ยังเหลือ* + *รายการ* (total) | Progress counted multiple ways | **Medium** |
| `PurchaseListHeader` date | Duplicates hero subtitle | **Low** |
| Per-line note fields | Visual noise on long lists | **Low** |
| Receive sheet unit conversion | Purchase unit vs stock unit unclear | **Medium** |

**Next step in 1s?** **No** — description implies ticking is the whole job.

**Suggested fixes:** AppShell description *ติ๊กเมื่อซื้อแล้ว แล้วกดเอาเข้าครัว*. When all ticked, inline helper *ซื้อครบแล้ว — กดเอาเข้าครัวด้านล่าง*. Simplify hero stats to one row.

---

### `/recipes` — Recipe library (`RecipesPage`)

**User intent:** Find or start a recipe.

**What they think about:** Recipe vs menu — which card is “my task”?

| Element | Issue | Severity |
|---------|-------|----------|
| *สร้างสูตรใหม่* + *สร้างเมนูขาย* both at top | **Two primary intents on one page** | **High** |
| *สูตรที่ยังไม่เสร็จ* vs *สูตรตัวอย่าง* | Must learn two library types | **Medium** |
| AppShell *สูตรในครัว* | Vague — doesn’t say “create or open” | **Low** |

**Next step in 1s?** **Partial** — create recipe clear; menu card competes.

**Suggested fixes:** Keep only *สร้างสูตรใหม่* as primary. One line link *มีสูตรแล้ว? ไปสร้างเมนูขาย*. Tag examples *ตัวอย่าง — ดูอย่างเดียว*.

---

### `/recipes/builder` — Recipe builder (`RecipeBuilderPage`)

**User intent:** Name → add ingredients → see cost → save.

**What they think about:** Brand title, English units, fake *ใช้บ่อย* tags.

| Element | Issue | Severity |
|---------|-------|----------|
| AppShell title *กำลัง...บิ้วเด้อ* | Cute brand, not operational | **Medium** |
| `IngredientPopup` units `g`, `kg`, `liter`, `piece`, `bunch` | English, not kitchen Thai | **High** |
| Every ingredient row *ใช้บ่อย* | Same on all rows — meaningless noise | **Medium** |
| Category placeholder *เมนูขายดี* | Wrong domain (sales vs recipe category) | **Low** |
| `BottomSummary` profit % | Unlabeled “what does % mean?” | **Low** |

**Next step in 1s?** **Yes** — empty state + *เพิ่มวัตถุดิบ*.

**Suggested fixes:** Title *สร้างสูตร*. Units *ก., กก., มล., ลิตร, ชิ้น, มัด*. Remove *ใช้บ่อย* or show real frequency only.

**Flow fit:** Strong Create → Add → Quantity → Result → Save.

---

### `/recipes/[slug]` — Standard recipe detail

**User intent:** View example recipe and costs.

**What they think about:** Why are bottom buttons dead? Should I save?

| Element | Issue | Severity |
|---------|-------|----------|
| `RecipeActionBar` disabled *ทำสำเนาสูตร* / *แปลงเป็นเมนูขาย* | **Ghost CTAs** — look tappable | **High** |
| `RecipeCostSummary` *บันทึกสูตร* on read-only demo | Save implies persistence user doesn’t have | **High** |
| `BatchSizeControl` label *ผลิต* | Sounds like production plan, not batch scale | **Medium** |
| Name in AppShell + `RecipeHero` | Duplicate title | **Low** |

**Next step in 1s?** **No** — disabled bar dominates.

**Suggested fixes:** Replace bar with one line *ตัวอย่าง — สร้างสูตรของคุณที่ สร้างสูตรใหม่*. Remove save on standard recipes. Label batch *ทำกี่เสิร์ฟ*.

---

### `/recipes/new` — Stub page

**User intent:** Unclear (wrong route).

| Element | Issue | Severity |
|---------|-------|----------|
| Route under `/recipes`, title *สร้างเมนูขาย* | Wrong module | **High** |
| Non-functional form + button | Looks complete, does nothing | **High** |

**Suggested fixes:** Redirect to `/menus/new` or remove route.

---

### `/menus` — Menu library (`MenusPage`)

**User intent:** Browse sellable menus; create new.

**What they think about:** Sample vs own menus.

| Element | Issue | Severity |
|---------|-------|----------|
| *เมนูของคุณ* vs *เมนูตัวอย่าง* | Same split as recipes | **Medium** |
| Create hint *เลือกสูตร ชุดบรรจุภัณฑ์ และราคาขาย* | Three decisions named at once | **Low** |

**Next step in 1s?** **Yes** — *สร้างเมนูขาย*.

**Suggested fixes:** Example chip on sample cards. Hint *เลือกสูตรและราคาก่อน — บรรจุภัณฑ์ทีหลังได้*.

---

### `/menus/new` & `/menus/[id]/edit` — Menu builder

**User intent:** Recipe + price (+ packaging) → margin → save.

**What they think about:** Too many numbers; is packaging required?

| Element | Issue | Severity |
|---------|-------|----------|
| `MenuBuilderSummary` **6 stats** in grid | Cognitive overload before save | **High** |
| *ชุดบรรจุภัณฑ์* | Jargon | **Medium** |
| Packaging *ไม่เลือก* | Unclear if optional | **Low** |

**Next step in 1s?** **Yes** — form order logical.

**Suggested fixes:** Bottom bar show 3: *ต้นทุนรวม, ราคาขาย, กำไร*. Label *กล่อง/ถุง/ช้อน (ชุด)*. Helper *ไม่บังคับ*.

---

### `/menus/[id]` — Menu detail

**User intent:** See menu economics.

**What they think about:** Where is profit? Why can’t I edit (samples)?

| Element | Issue | Severity |
|---------|-------|----------|
| `MenuCostSummary` inside `<details>` | Margin hidden by default | **Medium** |
| `MenuActionBar` disabled buttons on samples | Ghost CTAs (same as recipes) | **Medium** |
| AppShell + `MenuHero` name | Duplicate | **Low** |

**Next step in 1s?** **Partial** — saved menus: *แก้ไข* clear; samples: dead end.

**Suggested fixes:** One line under price *กำไรประมาณ X บาท*. Samples: single CTA *สร้างเมนูของคุณจากตัวอย่าง*.

---

### `/inventory` — Stock (`InventoryPage`)

**User intent:** See what’s low/out; adjust counts.

**What they think about:** Difference from *วัตถุดิบ* page.

| Element | Issue | Severity |
|---------|-------|----------|
| Nav *สต๊อก* vs *วัตถุดิบ* vs search *ของในครัว* | **Terminology triangle** | **High** |
| `InventoryAdjustSheet` *ขั้นต่ำ* | Non-obvious | **Medium** |
| `VersionHistoryPanel` in adjust sheet | Heavy for quick count | **Low** |

**Next step in 1s?** **Yes** — hero + filters.

**Suggested fixes:** Align vocabulary (see glossary). *เตือนเมื่อเหลือน้อยกว่า* instead of *ขั้นต่ำ*.

---

### `/ingredients` — Ingredient catalog

**User intent:** Reference list (read-only).

**What they think about:** “Why isn’t this where I fix stock?”

| Element | Issue | Severity |
|---------|-------|----------|
| Overlap with `/inventory` — shows *คงเหลือ*, status, price | **Two pages, same mental object** | **High** |
| No link to adjust stock | User must discover `/inventory` | **Medium** |

**Next step in 1s?** **Unclear** — browse-only.

**Suggested fixes:** Description *รายการและราคาซื้อ (ดูอย่างเดียว)*. Prominent link *ปรับของที่เหลือ → สต๊อก*.

---

### `/import` — Excel import (`ImportPage`)

**User intent:** Upload file → validate → save.

**What they think about:** English sheet names, conflict resolution jargon.

| Element | Issue | Severity |
|---------|-------|----------|
| `IMPORT_TYPE_OPTIONS` descriptions *แท็บ ingredients*, *recipe_lines* | **English dev copy in UI** | **High** |
| 4 type tiles before upload | Must choose entity before seeing file | **Medium** |
| `ImportConflictSheet` shows raw IDs | Technical | **Medium** |
| Long footer disclaimer | Reassuring but dense | **Low** |

**Next step in 1s?** **Yes** — pick type → upload.

**Suggested fixes:** *ชีตวัตถุดิบ*, *ชีตสูตร + รายการในสูตร* — no English in labels. Conflict copy *ใช้ข้อมูลจากไฟล์หรือเก็บของเดิม?*

---

### `/settings` — Settings (`SettingsPage`)

**User intent:** Store profile and costing defaults.

**What they think about:** How many numbers are required now vs later?

| Element | Issue | Severity |
|---------|-------|----------|
| GP + labour + gas + electricity all visible | Many optional fields feel mandatory | **Medium** |
| Overlap with `/setup` | Same fields, two places | **Medium** |
| *เป้ากำไร (%)* | May confuse with food cost % | **Low** |

**Next step in 1s?** **Partial** — form clear, no single “do this first” beyond save.

**Suggested fixes:** Intro *ใส่แค่ชื่อร้านและเป้ากำไรก่อน — ที่เหลือทีหลังได้*. Collapse advanced costs.

---

### `/settings/data` — Backup & restore

**User intent:** Download or restore backup.

**What they think about:** Restore anxiety, abstract “ส่วน”.

| Element | Issue | Severity |
|---------|-------|----------|
| Undo toast time pressure | *8 วินาที* without clear where to tap | **Medium** |
| *N ส่วน* on restore success | Abstract | **Low** |

**Next step in 1s?** **Yes** — two cards, clear actions.

---

### `/setup` — First-run setup (`SetupPage`)

**User intent:** Minimum config to start.

**What they think about:** Am I done? Why is the form still there?

| Element | Issue | Severity |
|---------|-------|----------|
| `SetupCompleteCard` then full `SetupForm` still visible | *ตั้งค่าเรียบร้อย* + same fields | **Medium** |
| *โหลดจาก Excel* vs *กลับหน้าแรก* vs skip | Three exits after complete | **Low** |

**Next step in 1s?** **Yes** before complete; **Partial** after.

**Suggested fixes:** After complete, collapse form behind *แก้ไขข้อมูลร้าน*. Primary CTA *กลับหน้าแรกวางแผนผลิต*.

---

### `/today` — Staff kitchen (`StaffTodayPage`)

**User intent:** Tick prep checklist from today’s plan.

**What they think about:** “Pre-orders” vs production targets — wrong mental model.

| Element | Issue | Severity |
|---------|-------|----------|
| `StaffPrepChecklistSection` title `PRODUCTION_UI.sections.preOrders` = **รายการสั่งล่วงหน้า** for plan menu lines | **Wrong label** — `copy.ts` defines preOrders as customer orders, not plan targets | **High** |
| `HomeStaffViewLink` not on home | Staff can’t find this screen | **High** |
| Hero *X/Y รายการ* + per-section *ทำแล้ว n/m* | Duplicate progress | **Low** |
| `StaffPrepEmpty` passive | Staff blocked with no owner action hint | **Low** |

**Next step in 1s?** **Yes** when plan exists — checklists are scannable.

**Suggested fixes:** Use `targetsToday` (*เป้าผลิตวันนี้*) or *เมนูที่ต้องทำวันนี้* for menu section. Render staff link on home + production. Empty hint *แจ้งเจ้าของวางแผนที่ แผนผลิต*.

---

### `/search` — Global search (`SearchPage`)

**User intent:** Find anything quickly.

| Element | Issue | Severity |
|---------|-------|----------|
| AppShell description + empty state same *ค้นหาในร้าน* | Duplicate | **Low** |
| Group *ของในครัว* vs page *สต๊อก* | Label mismatch | **Medium** |

**Next step in 1s?** **Yes** — placeholder guides input.

---

### `/notifications` — Alerts (`NotificationList`)

**User intent:** See what needs attention.

| Element | Issue | Severity |
|---------|-------|----------|
| `NotificationCard` whole card is link + footer *ไปดู* | Redundant affordance | **Low** |
| Page *สิ่งที่ต้องจัดการ* vs empty *ไม่มีอะไรต้องรีบดู* | Tone mismatch | **Low** |
| Badge type + title separate | Extra scan step | **Low** |

**Next step in 1s?** **Yes** — items are action-oriented.

---

### `/activity` — Activity log (`ActivityTimeline`)

**User intent:** Audit trail (power user).

| Element | Issue | Severity |
|---------|-------|----------|
| **No nav link** to `/activity` | Orphan — exists but undiscoverable | **High** |
| Passive empty state | OK for log, not daily workflow | **Low** |

**Suggested fixes:** Link from settings *ดูบันทึกล่าสุด* — or hide route until linked.

---

### `/costing` — Costing demo (`CostingPage`)

**User intent:** (None — demo page.)

| Element | Issue | Severity |
|---------|-------|----------|
| **Not linked** from nav or app | Orphan | **High** |
| Always first sample recipe | Looks like user’s menu | **High** |
| Badge *พร้อมขาย* on static demo | Misleading | **Medium** |
| *สัดส่วนต้นทุนอาหาร* + *30–35%* | Accounting jargon | **Medium** |

**Next step in 1s?** **No** — no user action path.

**Suggested fixes:** Banner *ตัวอย่าง — ไม่ใช่เมนูของคุณ*. Link from recipe builder as optional help — or remove from production builds.

---

### `/touch-test`

Dev-only — excluded from product audit.

---

## Screens that pass the 1-second test

| Screen | Why |
|--------|-----|
| `/recipes/builder` | Empty state + add ingredient + bottom result |
| `/production/edit` | Add menu + save bar |
| `/menus/new` | Create card + form + save |
| `/` (when setup done) | `HomeNextStep` single focus |
| `/notifications` | Action list |

---

## Screens that fail or partially fail

| Screen | Blocker |
|--------|---------|
| `/purchase` | Two-step buy/receive not explained in header |
| `/recipes/[slug]` | Ghost bottom CTAs |
| `/today` | Wrong section title *รายการสั่งล่วงหน้า* |
| `/costing` | Orphan demo masquerading as product |
| `/ingredients` | Unclear purpose vs inventory |
| `/recipes` | Competing create cards |

---

## Priority fix list (copy / layout only)

| P | Page | Confusing element | Fix |
|---|------|-------------------|-----|
| **P0** | `/purchase` | Buy vs receive | Rewrite AppShell + inline helper when all ticked |
| **P0** | `/today` | *รายการสั่งล่วงหน้า* for plan lines | Use *เมนูที่ต้องทำวันนี้* |
| **P0** | `/recipes/[slug]` | Disabled `RecipeActionBar` | Replace with example CTA text |
| **P0** | `/recipes/builder` | English units | Thai unit labels |
| **P1** | `/` | Hidden `HomeStaffViewLink` | Render when plan exists |
| **P1** | `/production` | Status 3× + deduct unclear | Trim badges; helper on *เสร็จแล้ว* |
| **P1** | `/recipes` | Two create cards | Menu CTA → link only |
| **P1** | `/inventory` + `/ingredients` | Naming overlap | Unify terms + purpose line on ingredients |
| **P1** | `/import` | English sheet names | Thai descriptions in `IMPORT_TYPE_OPTIONS` |
| **P2** | `/menus/new` | 6-stat bottom bar | Show 3 primary metrics |
| **P2** | `/costing`, `/activity`, `/recipes/new` | Orphan/stub routes | Banner, link, or redirect |
| **P2** | Sample menus | Disabled `MenuActionBar` | Same pattern as recipes |

---

## Recommended V1 scope

**P0 + P1** — highest thinking reduction, no new features:

1. Purchase copy (header + helper)
2. Today section title (`today/page.tsx` + `HomeStaffViewLink` hint)
3. Recipe detail bar + save removal on samples
4. Builder Thai units
5. Home staff link
6. Production status dedup + deduct helper
7. Recipes page single primary CTA
8. Import Thai sheet descriptions
9. Ingredients page purpose line

---

## Next step

Review priority list. Confirm **Cognitive Load V1** scope (recommended: P0 + P1). No implementation until approved per AGENTS.md.
