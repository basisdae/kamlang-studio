# KL Builder — Decision Log

Product and UX decisions.

For product vision and principles, see `docs/PRODUCT.md`.
For domain terms, see `docs/GLOSSARY.md`.
For engineering rules, see `AGENTS.md`.

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
