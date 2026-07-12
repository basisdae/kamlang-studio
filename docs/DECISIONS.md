# KL Builder — Decision Log

Product and UX decisions.

For product vision and principles, see `docs/PRODUCT.md`.
For domain terms, see `docs/GLOSSARY.md`.
For engineering rules, see `AGENTS.md`.

---

## Decision 0004

**Status:** Accepted

**Date:** 2026-07-12

**Title:** Marketing Workspace = Marketing Readiness (not Campaign Manager)

### Problem

Marketing was framed like a Campaign Manager (empty campaign state), which is the wrong mental model for Business Insight pre-open prep.

### Decision

1. **Marketing Workspace = Marketing Readiness** — prepare marketing readiness before go-live.
2. **Primary workflow = Checklist** — same Platform Checklist Module as Opening (`bi_assets` + `/opening/checklist`), differentiated by **category / topic** via `moduleViewConfig` (`summaryMode: "marketing"`).
3. **Landing Composition** shows: Marketing Ready %, remaining checklist, next action, topic modules, recent checklist — Primary CTA **ไปทำต่อ**.
4. **Modules (topics):** หน้าร้าน · ออนไลน์ · Branding · สิ่งพิมพ์ · Promotion · Content.
5. **Timeline** and **Documents** are secondary modules — not the protagonist.
6. **Campaign Module is out of scope for v0.x.**
7. Multi-business templates (ร้านอาหาร / คาเฟ่ / ร้านค้า / โรงงาน) may generate checklist later; starter apply for ร้านอาหาร is allowed without a Campaign Module.

### Impact

Marketing `visibleModules` includes `opening-checklist`. Opening rollups exclude Marketing categories so Opening readiness / budget stay clean.

### Related

Decision 0002 (Workspace Context · Platform Modules)

---

## Decision 0003

**Status:** Accepted

**Date:** 2026-07-12

**Title:** Context vs Content — Workspace Switcher and Page Header roles

### Problem

After the Switcher showed the full Workspace name, Landing / Page Headers still repeated that name (e.g. Switcher `ดำเนินกิจการ` + Header `ดำเนินกิจการ`), so Context and Content competed.

### Decision

Platform UI lock:

1. **Workspace Switcher = Context** — which Workspace (full name once; readable in ≤1s; never truncated).
2. **Page Header = Content** — the job on this screen (ภาพรวม, จัดซื้อ, สูตร, …).
3. Header must not reuse the Workspace label when the Switcher already shows it.

Canonical write-up: `docs/01-vision.md` · `docs/03-design-system.md` · `AGENTS.md` Design Rules.

### Impact

Landing titles and AppShell page titles name the work, not the Workspace. Dedup polish may follow in a later pass; the principle is locked now.

### Related

Decision 0002 (Workspace = Context in architecture)

---

## Decision 0002

**Status:** Accepted

**Date:** 2026-07-12

**Title:** Workspace Universe architecture — Platform Modules, Landing Composition, Insight Observer

### Problem

Workspace was starting to own URLs (`/lab`, `/finance`, `/operations`), which mixed Context with Module routes and blocked reuse.

### Decision

Stack:

**Platform → Business / Tenant → Workspace → Landing (Composition) → Platform Modules → Shared Core → Database**

Rules:

1. **Module** belongs to the **Platform** — reusable. Workspace selects modules, order, and view config — does not own or fork modules (`Budget` not `OpeningBudget` / `FinanceBudget`).
2. **Landing** is a **Composition** of several modules (summaries / previews / next action) — not a Module and not “the first module route”.
3. **Module exposes routes.** Workspace only selects, orders, and passes config.
4. **No Workspace-named routes** created only because a Workspace exists (`/lab`, `/finance`, `/operations`, …). Platform Landing entry is `/home` (Opening Landing remains `/opening` until unified).
5. **Explorer** is not a Workspace — it is the **Choose Workspace Hub** at `/modes`.
6. **Business / Tenant** (e.g. ตั้งเตา, ครัวเข้าเนื้อ, VARIIA) is the shop layer — not a Workspace.
7. **Business Insight** is an **Observer / Analysis** layer: reads Shared Core, does not own data, does not duplicate Module forms, and is **outside** Workspace → Landing → Module.
8. **Workspace is Context, not Business state.** Switching Business (tenant) must not reset or overwrite Workspace (Opening / Lab / Finance) by accident. Persist separately:
   - `currentBusiness` — which tenant (ตั้งเตา, …)
   - `currentWorkspace` — which work context (Opening, Lab, Finance, …)

### Impact

Route Matrix and Module Matrix are locked. Refactor aligns landings and redirects to this model. Storage keys for Business and Workspace stay independent to support multi-tenant later.

### Related

Workspace Universe v0.4

---

## Decision 0001

**Status:** Accepted

**Date:** 2026-07-02

**Title:** Ingredient popup remains open after adding.

### Problem

Restaurant owners usually add many ingredients in sequence.

Closing the popup after every add interrupts flow.

### Decision

The popup remains open.

The search view returns automatically.

Previous quantity is remembered.

A small success message is displayed.

### Alternatives

1. Close popup every add.

   Rejected.

   **Reason:** Too many taps.

### Impact

Faster recipe building.

### Related

Builder V2-002

---
