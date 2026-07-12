# KL Builder (กำลัง...บิ้วเด้อ) — Engineering

> **Product direction update:** This repo is evolving into **Business Insight** (workspace: ตั้งเตา).  
> **Primary guideline:** `docs/01-vision.md` (Philosophy · UI Principles · Future Direction).  
> See also `docs/00-naming.md` … `docs/06-feature-list.md`.  
> Legacy kitchen builder rules below still apply to Recipe / Menu / Production code — do not change those formulas without approval.

Mobile-first recipe builder for restaurant owners (legacy) + Business Operating System for opening and growth (Business Insight).

**Business Insight:** `docs/01-vision.md` (main) · `docs/00-naming.md` · **Design:** `docs/03-design-system.md` · **Rules:** `docs/04-business-rules.md`  
**Legacy product:** `docs/PRODUCT.md` · **Glossary:** `docs/GLOSSARY.md` · **Decisions:** `docs/DECISIONS.md` · **Roadmap:** `docs/TASKS.md`

---

# Golden Rule

**Primary guideline:** `docs/01-vision.md`

Every UI decision must answer:

**"Will this help a restaurant owner decide faster and feel less stressed?"**

And:

**"แล้วเราควรทำอะไรต่อ?"**

**Opening OS question (every Opening screen):**

**"วันนี้ร้านยังต้องเตรียมอะไรบ้าง"** / **ร้านพร้อมเปิดหรือยัง**

Every page needs: ภาพรวม · สิ่งที่ควรทำต่อ · รายละเอียด · Action.

If not, do not add it.

This overrides decoration, feature creep, and "nice to have" polish.

---

# Opening OS Principles (v0.3+)

1. **Workflow First** — รายการเตรียมเปิดร้าน (Checklist) is the protagonist; Hub is the dashboard (Ready result lives on Hub, not a separate menu).
2. **Single Source of Truth** — Business data lives in Supabase (`bi_assets` for opening items). No duplicate business datasets in localStorage.
3. **Multiple Views** — รายการเตรียมเปิดร้าน / งบประมาณ / ทรัพย์สิน / วัตถุดิบเริ่มต้น are views of the same data, not separate systems. Nav labels use owner language; URLs may stay English.
4. **Summary = outcome** — Ready %, remaining count, and money still needed are derived from checklist data, never a second source of truth. “พร้อมเปิดหรือยัง” is the Hub result, not its own route in IA.
5. **One Thing, One Place** — One real dataset; many views. Changing status on any screen must reflect on Hub, Checklist, Budget view, Assets view, and Readiness immediately (same provider state).
6. **Refactor, not Rewrite** — Prefer existing components (AppShell, SummaryCard, AssetCompactRow, AssetForm, BiDataStatus, etc.). Move, rename, and re-wire workflow before inventing new UI. New components only when nothing existing fits.
7. **Route Compatibility** — Old Opening URLs must redirect to the new IA (never 404 for bookmarks). Examples: `/opening/ready` → `/opening`, `/opening/initial-stock` → `/opening/checklist/ingredients`.
8. **Zero Duplicate** — Hub Summary, Budget, Assets, and Checklist must share one calculation path (`buildOpeningSummary` / `buildInventoryBuckets` / `AssetProvider`). No parallel rollups. Status edits update every view via the same provider state. v0.3 must not lose or diverge from the user’s real Supabase data.

Owner language: มีแล้ว · ต้องจัดหา · สั่งแล้ว · ได้รับแล้ว  
Primary nav labels: รายการเตรียมเปิดร้าน · งบประมาณ · ทรัพย์สิน · วัตถุดิบเริ่มต้น (not English system terms).

**v0.3 goal:** Better workflow + mental model; **data identical 100%** to the live `bi_assets` set.

---

# Design Rules

## Context vs Content (Platform UI lock)

- **Workspace Switcher = Context** — show the Workspace name once (full label, never truncated).
- **Page Header = Content** — name the work on this screen (ภาพรวม, จัดซื้อ, สูตร, …).
- Header / Landing title must **not** repeat the Workspace label when the Switcher already shows it.
- Canonical rule: `docs/01-vision.md` → UI Principles → Context vs Content · `docs/03-design-system.md` §1.

DO

- Prefer Business Insight tokens (Lemon / White / Light Gray) for new screens
- Keep typography and spacing consistent
- Use existing Card / AppShell / BI components
- Reuse components whenever possible

DON'T

- Redesign legacy kitchen screens without need
- Use large lemon backgrounds
- Introduce unnecessary animations
- Increase visual complexity
- Use emoji as primary icons
- Duplicate Workspace name in Page Header when Switcher is visible

---

# Architecture Rules

Prefer small reusable components.

New BI UI lives under `components/bi/`.

Opening Plan lives under `app/opening/`.

Keep page.tsx small.

Target:

120-180 lines.

---

# TypeScript

Use strict typing.

Avoid any whenever possible.

Extract reusable types.

---

# React Rules

Prefer functional components.

Prefer composition over duplication.

Keep state localized.

Avoid unnecessary rerenders.

---

# Business Logic

Never modify calculations unless requested.

Never modify pricing rules.

Never change Food Cost formulas without approval.

See `docs/GLOSSARY.md` for domain term definitions.

Business Insight financial logic is sample-only until approved.

---

# Mobile Rules

Primary device:

iPhone / Android

Target width:

390px

Everything should work comfortably with one hand.

---

# Development Rules

Before making major edits:

1. Explain the implementation plan.

2. Wait for confirmation.

3. Then modify files.

---

# Git

Small commits.

Clear commit messages.

Never rewrite unrelated files.

---

# Code Style

Readable first.

Simple first.

Maintainable first.

Avoid clever code.

---
