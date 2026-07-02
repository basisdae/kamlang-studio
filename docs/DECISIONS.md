# KL Builder — Decision Log

Product and UX decisions.

For product vision and principles, see `docs/PRODUCT.md`.
For domain terms, see `docs/GLOSSARY.md`.
For engineering rules, see `AGENTS.md`.

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
