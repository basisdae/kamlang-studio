# Mobile Comfort Audit

**Goal:** Every screen comfortable for one-handed use in a kitchen — large fingers, wet hands, tired owner.

**Target:** 390px width, 44px minimum touch targets (Apple HIG / Material baseline).

**Scope:** Layout, spacing, and tap targets only — no business logic changes.

---

## Findings (before)

| Area | Issue | Severity |
|------|-------|----------|
| `kl-btn-sm` / `kl-icon-button-sm` | 40px — below 44px minimum | High |
| Caption links ("ลบ", settings nav) | ~20px tap height | High |
| `kl-notification-chip` (home) | ~28px tall | Medium |
| No top safe-area | Content tight under notch | Medium |
| `kl-builder-scroll` | Fixed 11rem, no device safe-area | Medium |
| Builder-layer sheets | `pb-4` only — could sit behind nav | Medium |
| Legacy sheets (`AddIngredientSheet`, `IngredientLineEditor`) | Same nav gap issue | Medium |
| `/production` detail scroll | Extra action-bar padding with no bottom bar | Low |

### Already strong

- Default buttons/inputs at **48px**
- Bottom nav + `kl-page-above-nav` use `env(safe-area-inset-bottom)`
- `viewportFit: cover` in root layout
- Checklist rows, recipe ingredient rows, upload zones at or above 44px
- Tiered scroll utilities for action bars

---

## Changes (implemented)

### Global tokens (`app/globals.css`)

| Change | Effect |
|--------|--------|
| `--kl-touch-min: 2.75rem` (44px) | Shared minimum across components |
| `kl-btn-sm`, `kl-icon-button-sm` → `--kl-touch-min` | All small buttons/icons meet 44px |
| `.kl-tap-link` | Inline text actions get 44px hit area + negative margin padding |
| `.kl-page-safe-top` / `--compact` | `max(padding, safe-area-inset-top)` on every AppShell page |
| `.kl-builder-scroll` | Adds `safe-area-inset-bottom` to builder scroll pad |
| `.kl-sheet-builder` | Nav-aware bottom padding for builder-layer sheets |
| `touch-action: manipulation` | Buttons, nav, pressables, segments — faster taps, less double-tap zoom |
| `kl-notification-chip`, `kl-picker-row`, `kl-details-summary`, `kl-home-action` | Bumped to 44px min-height |

### Layout & sheets

| File | Change |
|------|--------|
| `AppShell.tsx` | Safe-top padding replaces fixed `pt-4` / `py-7` top |
| `BottomSheet.tsx` | Builder layer uses `kl-sheet-builder` |
| `AddIngredientSheet.tsx` | `kl-sheet-overlay` + `min-h-11` list rows |
| `IngredientLineEditor.tsx` | `kl-sheet-overlay` |

### Screen-specific

| File | Change |
|------|--------|
| `production/page.tsx` | Removed unused `kl-scroll-above-bottom-bar` (~84px less dead scroll) |
| `RecipeLines.tsx` | Row + edit tap `min-h-11`; delete uses `kl-tap-link` |
| `ProductionBuilderForm.tsx` | Delete uses `kl-tap-link` |
| `settings/page.tsx` | Card links use `kl-tap-link` |
| `SectionLink.tsx` | `min-h-[3.25rem]` on nav/create cards |
| `SetupCompleteCard.tsx` | Home link uses `kl-tap-link` |

---

## Thumb reach & scrolling

| Pattern | Status |
|---------|--------|
| Primary actions in bottom nav | Unchanged — thumb zone |
| Action bars above nav | Unchanged — `kl-action-bar` + safe-area |
| Home focus hero | Full-width tap — good for thumb |
| Production page scroll | Reduced unnecessary bottom padding |
| Builder pages | Safe-area added to scroll pad |

---

## Kitchen environment notes

- `touch-action: manipulation` reduces accidental zoom while scrolling lists with flour on screen
- Larger delete/link targets reduce mis-taps when rushing prep
- Safe-area top/bottom keeps controls off notch and home indicator when phone is in a stand or pocket

---

## Not changed (deferred)

| Item | Reason |
|------|--------|
| Menu builder 6-stat bottom bar height | Cognitive load item — separate task |
| Consolidate `ActionBar` vs `kl-bottom-bar` | Component reuse — already tracked |
| `recipes.css` legacy 42px buttons | Unused in app routes |
| `/touch-test` dev page | Out of product scope |

---

## Test plan

1. **iPhone with notch** — home, settings, builder: content clears notch and home indicator
2. **Recipe builder** — tap ingredient row, delete "ลบ", add button — all feel chunky
3. **Production edit** — delete line, scroll to bottom — content not hidden behind summary bar
4. **Purchase** — checklist rows still easy to hit
5. **Sheets** — ingredient picker / line editor clear bottom nav
6. **Production detail** — scroll ends closer to nav (less empty space)
