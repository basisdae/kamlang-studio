# Final Readiness Report — “Would I Recommend This App?”

**Audit date:** July 2026  
**Lens:** External reviewer. Never built Kamlang. Restaurant owner who closes at midnight, uses phone, hates spreadsheets, needs to trust the numbers.  
**Scope:** UX, speed, trust, clarity, restaurant workflow — after all polish passes and simulation fixes.

---

## Verdict

### Would I recommend Kamlang to another restaurant owner today?

**No — not as a daily replacement for Excel or a paper notebook.**

I would recommend it **only as a beta preview** to an owner who:

- Already has ingredient data in Excel (or is willing to learn import),
- Accepts that data lives in one browser until they export backup,
- Wants to experiment with recipe costing before committing to a menu change,
- Has patience for setup and occasional “is this sample or mine?” confusion.

For the tired owner described in `PRODUCT.md` — closing the shop, one hand on the phone, wanting to plan tomorrow and go home — **Kamlang is not ready to bet the shop on yet.**

---

## Why not (brutally honest)

### 1. Trust — the app can lie without meaning to

| Issue | Owner experience |
|-------|------------------|
| Demo data ships by default | “Did I already plan today?” — seed production uses today’s date |
| Sample mixed with yours | เมนูตัวอย่าง beside your menus; no persistent “this is demo” banner |
| Browser-only storage | Clear cache / new phone = gone unless they found Settings → backup |
| Purchase list = gross need | Shopping list ignores stock on hand — over-buy or lose faith in numbers |
| Editing demo plan | Materializes into “your” data with no explanation |

**Trust is the ceiling.** Pretty UI cannot fix wrong shopping quantities or lost data.

### 2. Workflow — first mile is still Excel-shaped

The **daily loop** (แผนผลิต → ซื้อของ → เอาเข้าครัว → งานครัววันนี้) is the strongest part of the product. Navigation, copy, and home hierarchy now point there clearly.

The **setup loop** (วัตถุดิบ → สูตร → เมนูขาย) still breaks the promise of “a game for building food”:

- **No manual ingredient add** — blocked without Excel or pre-loaded demo ingredients
- **Import buried** — not in bottom nav; discovery via empty states or เพิ่มเติม
- **Two invisible data layers** — builder `localStorage` + Excel user-master, bridged in code but not felt as one system
- **Menus under เพิ่มเติม** — sellable items are second-class vs สูตร and แผนผลิต

Recent fixes (recipe/menu → production wiring, `/recipes/new`, post-save CTAs) **unblocked the chain** for owners who already have ingredients. They did not remove the Excel dependency or the “where do I start?” problem.

### 3. Speed — good builders, bad first week

| Area | Assessment |
|------|------------|
| Recipe builder | Fast, live cost — **best screen in the app** |
| Production builder | Reasonable tap count once menus exist |
| Purchase receive | Works but easy to miss tick-before-receive |
| First-time setup | **6–10+ taps** before feeling productive; setup gate blocks home focus |
| Recurring daily use | **3–5 taps** to plan → shop list — competitive *if* master data exists |

Speed optimizations (home → edit, import links, flow CTAs) helped **returning** users more than **new** users.

### 4. Clarity — language improved; mental model did not

Grandma Test copy pass removed ERP jargon. Owners still must infer:

- What is sample vs owned
- Why Excel is the “real” ingredient path
- Why saved recipes lived in a different world than menus (partially fixed, not explained in UI)
- That inventory updates only through purchase receive, not purchase list alone

### 5. Business value — partial

| Delivers today | Does not deliver today |
|----------------|------------------------|
| Recipe food cost while building | Accurate **net** shopping list |
| Menu margin preview | In-app ingredient price maintenance |
| Production-driven purchase rollup | Multi-device / staff accounts |
| Kitchen prep checklist | POS or sales integration |
| Local backup export | Automatic backup or cloud sync |

**Value proposition today:** “Play with recipes and plan a day in the kitchen” — **not** “Run my restaurant data system.”

---

## What works (why it’s close, not far)

1. **Mobile-first shell** — touch targets, safe areas, bottom nav match real phone use
2. **Visual coherence** — palette, cards, premium polish pass; does not feel like a hackathon
3. **Home hierarchy V2** — one focus card when setup complete; clear next step toward แผนวันนี้
4. **Restaurant language** — แผนผันนี้, ของในครัว, เอาเข้าครัว read naturally
5. **Recipe builder UX** — immediate cost feedback; closest to PRODUCT vision
6. **Ops chain wiring** — production → purchase → inventory → `/today` is conceptually sound
7. **Simulation fixes** — builder recipes/menus in pickers; broken `/recipes/new` fixed; flow links added

The product **knows what restaurant owners need**. It does not yet **fully deliver** on the first week or on trust in numbers.

---

## Scores

Scale: **1–10** (10 = confidently recommend to a peer; 5 = promising prototype)

| Dimension | Score | One-line rationale |
|-----------|-------|-------------------|
| **UI** | **7.5** | Clean, consistent components; comfortable on ~390px; minor duplicate CTAs remain |
| **UX** | **6.0** | Strong builders; weak onboarding, gates, and post-setup discovery |
| **Workflow** | **5.5** | Daily loop natural; setup loop Excel-dependent; menus/import hidden |
| **Visual Design** | **7.5** | Cohesive, calm, not spreadsheet-like; not yet “exceptional” brand moment |
| **Business Value** | **6.0** | Costing and planning help; shopping and data persistence gaps limit ROI |
| **Restaurant Readiness** | **4.5** | Not safe as sole system of record for a real shop today |
| **Overall** | **6.0** | **Promising beta** — not a recommendation for production daily use |

**Weighted read:** UI and visual design lead; **restaurant readiness drags overall** below “yes, use this tomorrow.”

---

## If the answer were “yes” — what still prevents exceptional?

Even with a “yes” for early adopters, exceptional would require:

1. **Zero ambiguity** between demo and owned data
2. **First ingredient in &lt; 60 seconds** without Excel
3. **Shopping list you’d hand to staff** — net of stock, unit clarity, no double-buy anxiety
4. **Data you cannot accidentally lose** — visible backup rhythm or sync
5. **One story end-to-end** — setup wizard that finishes in menu + plan, not documentation in `docs/`

---

## Top 20 improvements (ranked by impact)

Impact = effect on **recommendation likelihood** × **users affected** × **trust/workflow severity**.

| Rank | Improvement | Impact | Effort (est.) | Primary dimension |
|------|-------------|--------|---------------|-------------------|
| **1** | **Quick-add ingredient** (name, unit, price) — no Excel required | Critical | M | Workflow, UX |
| **2** | **Purchase list nets inventory on hand** (show gross + net + “มีในครัวแล้ว”) | Critical | M | Trust, Business |
| **3** | **Demo vs yours — persistent clarity** (banner, filter, or “เริ่มใหม่ไม่ใช้ตัวอย่าง”) | Critical | S–M | Trust, Clarity |
| **4** | **Excel template download + 3-step import wizard** on first setup | High | M | Workflow, Trust |
| **5** | **Unify data on save** — saved recipe/menu promotes to single master (no dual path) | High | L | Trust, Workflow |
| **6** | **First-run setup wizard** — วัตถุดิบ → สูตร → เมนู → แผน (skippable) | High | L | UX, Workflow |
| **7** | **Backup prompt** after first save + periodic “สำรองข้อมูล” nudge on home | High | S | Trust |
| **8** | **Import / โหลด Excel in setup banner & primary path** (not only เพิ่มเติม) | High | S | Speed, Clarity |
| **9** | **Edit ingredient price/unit in-app** (tap row → sheet) | High | M | Workflow, Business |
| **10** | **Fresh user: no auto-today demo plan** — empty production until they plan or opt into sample | High | S | Trust |
| **11** | **Home + notifications → `/production/edit?date=today`** (remove +1 tap) | Medium | S | Speed |
| **12** | **Menu save → “ใส่ในแผนวันนี้”** with menu pre-selected | Medium | S | Workflow, Speed |
| **13** | **เมนูขาย in primary nav** or paired with สูตร in setup messaging | Medium | S | Workflow |
| **14** | **Purchase UX** — stronger tick → เอาเข้าครัว sequence; confirm stock updated | Medium | M | Trust, UX |
| **15** | **Plain-Thai import errors** (row N: ไม่มีชื่อวัตถุดิบ) not parser jargon | Medium | S | Clarity, Trust |
| **16** | **Ingredients ↔ ของในครัว cross-links** on every list (not noise — one line) | Medium | S | Workflow |
| **17** | **Recipe post-save → navigate to list** or success screen with next actions | Medium | S | Speed |
| **18** | **Menu library → edit in one tap** (skip detail hop) | Medium | S | Speed |
| **19** | **“Start fresh” path** — clear local user data + hide demo plan in one confirmed action | Medium | M | Trust |
| **20** | **PWA install + offline cue** — “ข้อมูลอยู่ในเครื่องนี้” on settings/home | Medium | M | Trust, Clarity |

### Tier summary

| Tier | Ranks | Theme |
|------|-------|-------|
| **P0 — Recommend blockers** | 1–5 | Onboarding without Excel, trustworthy shopping, honest data model |
| **P1 — First-week success** | 6–10 | Guided setup, backup habit, no demo surprises |
| **P2 — Daily speed & polish** | 11–18 | Fewer taps, stronger chain CTAs, in-app maintenance |
| **P3 — Platform trust** | 19–20 | Fresh start, device-local honesty |

---

## Recommendation matrix

| Owner profile | Recommend today? | Why |
|---------------|------------------|-----|
| Has Excel ingredient list ready | **Maybe** — try recipe + plan beta | Chain works after import; verify backup habit |
| No Excel, wants phone-only | **No** | Blocked at ingredients |
| Already uses another app/POS | **No** | No integration; duplicate data entry |
| Wants costing lab for new dishes | **Yes, with caveats** | Recipe builder delivers; ignore ops until data loaded |
| Runs kitchen staff off shopping list | **No** | Gross list vs stock; trust risk |
| Tired owner, daily driver | **No** | Setup friction + data trust |

---

## Path to “yes” (minimum bar)

To honestly say **“ใช้ได้เลย แนะนำเพื่อนได้”**:

1. Owner adds first ingredient without Excel (**#1**)
2. Shopping list reflects what’s actually missing (**#2**)
3. Owner always knows what is sample vs theirs (**#3**)
4. Owner has exported backup once, prompted by app (**#7**)
5. Complete setup → plan → purchase → kitchen in one guided path without reading docs (**#6, #8**)

**Estimated product gap:** 2–4 focused iterations on P0 + P1 — not a redesign.

---

## Audit lineage (inputs to this report)

| Document | Contribution |
|----------|--------------|
| `RESTAURANT_WORKFLOW_AUDIT.md` | Chain breaks, dual data paths |
| `RESTAURANT_OWNER_SIMULATION_REPORT.md` | Persona walkthrough, fixes applied |
| `KITCHEN_SPEED_REPORT.md` | Tap budgets, navigation tax |
| `HOME_HIERARCHY_REPORT_V2.md` | Daily vs setup focus |
| `GRANDMA_TEST_REPORT.md` | Language clarity |
| `MOBILE_COMFORT_REPORT.md` | Touch, safe area |
| `PREMIUM_POLISH_REPORT.md` | Visual quality ceiling |
| `UI_NOISE_REPORT.md` / `VISUAL_CONSISTENCY_REPORT.md` | Density and consistency |
| `COGNITIVE_LOAD_REPORT.md` / `UX_AUDIT_REPORT_V2.md` | Information hierarchy |

---

## Stop for review

**No code changes in this pass** — report only.

**Suggested next decision:**

- **Option A:** Implement P0 items **#1–#3** (biggest recommend lift)
- **Option B:** Implement quick wins **#7, #8, #10, #11** (trust + speed, smaller scope)
- **Option C:** User testing with 2–3 real owners using `NEXT_PUBLIC_KL_DATA_SOURCE=user` + recorded session

---

*Prepared for product review. Scores reflect July 2026 codebase state after simulation fixes and polish passes.*
