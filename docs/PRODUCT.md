# KL Builder — Product

กำลัง...บิ้วเด้อ

This document is the source of truth for product decisions.

For engineering rules, see `AGENTS.md`.
For domain terms, see `docs/GLOSSARY.md`.
For recorded decisions, see `docs/DECISIONS.md`.
For the task roadmap, see `docs/TASKS.md`.

---

# Vision

KL Builder is not a food cost calculator.

It is a tool for designing food before cooking it.

The goal is to make recipe creation enjoyable.

Users should feel like they are building dishes,
not filling spreadsheets.

Restaurant owners don't fail because they cannot calculate.

They fail because experimenting with new ideas is too expensive.

KL Builder reduces the cost of experimentation.

---

# The Problem

Today, trying a new menu idea is risky.

Every experiment in the kitchen costs time, ingredients, and confidence if it doesn't work out.

Spreadsheets and manual cost tracking feel like admin work — especially at the end of a long service day.

Owners often guess at portions and prices, cook first, and only discover the true cost afterward.

There is no safe place to play with a recipe before committing to it.

The barrier is not math. The barrier is the **cost of trying**.

---

# Product Philosophy

The principles behind every feature:

- **Golden rule:** Will this help an owner work faster and feel less stressed? If not, don't add it.
- Every tap should feel rewarding.
- Reduce thinking.
- Reduce scrolling.
- Reduce typing.
- Immediate feedback.
- No unnecessary dialogs.
- Build, don't fill forms.

The preferred flow is simple:

Create a recipe → add ingredients → enter quantity → see the result immediately → save.

Never force unnecessary navigation.

Optimize for speed.

---

# User Mindset

Users are usually tired after closing the restaurant.

They have limited time and limited patience for complex tools.

They want confidence — to know a dish can work before they prep it.

They want to experiment without wasting money.

They are not looking for another spreadsheet.

They want to feel progress with every action, not fill in another form field.

---

# Interaction Philosophy

Every tap should feel rewarding.

The user should feel like they are building something,
not filling a form.

Build, don't fill forms.

Reduce thinking.

Reduce typing.

Reduce scrolling.

Prefer immediate feedback over confirmation dialogs.

When something succeeds, show it right away.
When something fails, explain it inline — don't block the flow with a modal.

---

# UX Principles

- **One-handed usage** — primary actions reachable with the thumb on a phone.
- **Sticky summary** — cost, price, and profit always visible while building.
- **Fast iteration** — add multiple ingredients without restarting the flow.
- **Comfort over density** — spacious layout, large touch targets, room to breathe.
- **Mobile first** — designed for the device owners actually use after service.

---

# Design Principles

- **Clean** — clear hierarchy, no visual noise.
- **Friendly** — warm tone, approachable language, feels like a tool made for cooks.
- **Minimal** — only what the user needs for the current step.
- **Never overwhelming** — one decision at a time; complexity reveals itself only when needed.

The experience should feel closer to a modern design tool than a spreadsheet.

---

# Long-term Vision

KL Builder is not just a recipe calculator.

It is the decision support system for restaurant owners.

A recipe should fail on the screen,
not in the kitchen.

Over time, KL Builder grows from a fast recipe builder into a full menu design workspace:

- A rich ingredient system that reflects how restaurants actually buy and stock food.
- A recipe library to search, favorite, version, and organize the menu.
- Costing tools to simulate prices and understand profit before changing the menu.
- Inventory awareness so recipes connect to what is on hand.
- A dashboard that surfaces what matters — most expensive dishes, highest profit, what needs attention.

The north star never changes:

**"A game for building food — not a spreadsheet."**

---
