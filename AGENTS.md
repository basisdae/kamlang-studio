# KL Builder (กำลัง...บิ้วเด้อ) — Engineering

Mobile-first recipe builder for restaurant owners.

**Product:** `docs/PRODUCT.md` · **Glossary:** `docs/GLOSSARY.md` · **Decisions:** `docs/DECISIONS.md` · **Roadmap:** `docs/TASKS.md`

---

# Golden Rule

Every UI decision must answer:

**"Will this help a restaurant owner work faster and feel less stressed?"**

If not, do not add it.

This overrides decoration, feature creep, and "nice to have" polish.

---

# Design Rules

DO

- Keep existing color palette
- Keep typography
- Keep spacing consistent
- Use existing Card component
- Use existing AppShell
- Reuse components whenever possible

DON'T

- Redesign screens
- Change theme
- Introduce unnecessary animations
- Increase visual complexity

---

# Architecture Rules

Prefer small reusable components.

Target structure:

builder/

page.tsx

components/

HeaderForm.tsx

RecipeLines.tsx

IngredientPopup.tsx

BottomSummary.tsx

types.ts

utils.ts

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
