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

Every page needs: ภาพรวม · สิ่งที่ควรทำต่อ · รายละเอียด · Action.

If not, do not add it.

This overrides decoration, feature creep, and "nice to have" polish.

---

# Design Rules

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
