# Component Reuse Audit Report

**Audit date:** July 2026  
**Goal:** Reduce duplicated UI primitives without changing functionality  
**Rules:** Shared components only — no behavior or business logic changes

---

## Summary

| Category | Before | After |
|----------|--------|-------|
| Bottom sheets / dialogs | 8+ inline overlay implementations | `BottomSheet` |
| Fixed bottom actions | 6+ `kl-action-bar` copies | `ActionBar` |
| Sheet cancel/confirm rows | 5+ duplicate button grids | `SheetActions` |
| Form label + input + error | Repeated in 7+ forms | `FormField` (started) |
| Section nav / create CTAs | 4 inline `kl-section` links | `SectionLink` |
| Buttons, Cards, Badges | Already centralized | No change needed |

**Build:** `npm run build` passes  
**Commits:** None (stopped for review)

---

## New shared components (`components/ui/`)

### `BottomSheet.tsx`
Unified bottom overlay for dialogs and sheets.

| Prop | Purpose |
|------|---------|
| `surface` | `"card"` (Card body), `"panel"` (`kl-sheet`), `"modal"` (builder popup) |
| `layer` | `"overlay"` (nav-aware z-60) or `"builder"` (z-50 + pb-4) |
| `closeOnBackdrop` | Default `true`; `false` for import/backup confirm |
| `scrollable` | Max-height scroll on card/panel |

### `ActionBar.tsx`
Wraps `kl-action-bar` + `kl-action-bar-inner` with optional `innerClassName`.

### `SheetActions.tsx`
Two-column cancel/confirm button row. Supports `className` for `gap-2` vs `gap-3`.

### `FormField.tsx`
`label` + children + optional `error` using `kl-type-label` / `kl-type-caption`.

### `SectionLink.tsx`
| Variant | Use |
|---------|-----|
| `create` | Plus icon well + title (recipes/menus list CTAs) |
| `nav` | Title + chevron (purchase header, staff link) |

---

## Migrations completed

### Dialogs / sheets → `BottomSheet`

| File | Surface | Notes |
|------|---------|-------|
| `ImportConflictSheet.tsx` | card | `closeOnBackdrop={false}` |
| `BackupConfirmSheet.tsx` | card | `closeOnBackdrop={false}` |
| `ProductionDeductConfirmSheet.tsx` | card | Backdrop dismiss |
| `InventoryAdjustSheet.tsx` | panel | Scroll |
| `PurchaseReceiveSheet.tsx` | panel | Both repeat-confirm + main |
| `IngredientPopup.tsx` | modal | `layer="builder"` |

### Action bars → `ActionBar`

| File |
|------|
| `PurchaseReceiveBar.tsx` |
| `RecipeSampleFooter.tsx` |
| `BottomSummary.tsx` (recipe builder) |
| `MenuActionBar.tsx` |
| `ProductionHeroActions.tsx` (delete confirm only) |

### Sheet actions → `SheetActions`

| File |
|------|
| `ImportConflictSheet.tsx` |
| `BackupConfirmSheet.tsx` |
| `ProductionDeductConfirmSheet.tsx` |
| `InventoryAdjustSheet.tsx` |
| `PurchaseReceiveSheet.tsx` |

### Forms → `FormField`

| File | Fields migrated |
|------|-----------------|
| `HeaderForm.tsx` | ชื่อสูตร, หมวดหมู่ |
| `SetupForm.tsx` | All 4 fields |
| `InventoryAdjustSheet.tsx` | 3 inputs |
| `PurchaseReceiveSheet.tsx` | Receive quantity per line |

### Navigation rows → `SectionLink`

| File | Variant |
|------|---------|
| `recipes/page.tsx` | create |
| `menus/page.tsx` | create |
| `PurchaseListHeader.tsx` | nav |
| `HomeStaffViewLink.tsx` | nav |

---

## Already well-centralized (no changes)

| Component | Location | Usage |
|-----------|----------|-------|
| `Button` / `ButtonLink` | `components/ui/Button.tsx` | All CTAs |
| `Card` | `components/ui/Card.tsx` | All surfaces |
| `Badge` | `components/ui/Badge.tsx` | Status chips |
| `SectionTitle` | `components/ui/SectionTitle.tsx` | Section headers |
| `StatCell` | `components/ui/StatCell.tsx` | Metrics |
| `HeroCard` | `components/ui/HeroCard.tsx` | Module heroes |
| `EmptyState` | `components/ui/EmptyState.tsx` | Empty views |
| `SearchBar` | `components/ui/SearchBar.tsx` | Search inputs |
| `CategoryChip` | `components/ui/CategoryChip.tsx` | Ingredient categories |
| `StepperButton` | `components/ui/StepperButton.tsx` | Batch controls |
| `IconButton` / `IconButtonLink` | `components/ui/` | Icon actions |

---

## Open items (future reuse)

### Sheets not yet migrated

| File | Reason deferred |
|------|-----------------|
| `AddIngredientSheet.tsx` | Card + drag handle + unique layout |
| `IngredientLineEditor.tsx` | Custom `kl-sheet--modal` in sample recipe |
| `AppNavMoreSheet.tsx` | Nav-specific scrim z-index |

### Forms still using inline labels

| File |
|------|
| `SettingsForm.tsx` |
| `MenuBuilderForm.tsx` |
| `ProductionBuilderForm.tsx` |

Migrate with `FormField` + shared `const fieldClassName = "kl-input mt-2"` export if desired.

### Builder bottom bars (fixed position variant)

`MenuBuilderSummary.tsx` and `ProductionBuilderSummary.tsx` use `fixed inset-x-0 kl-bottom-bar` + `kl-action-bar-inner` — different from floating `ActionBar`. Consider `BuilderBottomBar` wrapper if a third builder adds the same pattern.

### List patterns

`kl-list` / `kl-list-row` used consistently in production, purchase, inventory — no duplicate component needed; CSS utilities are the abstraction.

### Checkbox circles

`PurchaseListItems.tsx` and `StaffPrepChecklistSection.tsx` share similar tick UI — candidate for `CheckCircle` component (low priority).

### `RecipeActionBar.tsx`

Legacy file may still exist alongside `RecipeSampleFooter` — verify and remove if unused.

---

## Verification checklist

1. **Import conflict** — open duplicate import; backdrop tap should NOT dismiss  
2. **Backup restore** — confirm sheet; same non-dismiss behavior  
3. **Inventory adjust** — open sheet, save/cancel, backdrop dismiss  
4. **Purchase receive** — repeat-receive prompt + main sheet  
5. **Recipe builder** — ingredient popup add flow  
6. **Production** — deduct confirm sheet  
7. **Menu detail** — action bar edit/duplicate/delete  
8. **Recipes/Menus list** — create CTA rows look unchanged  

---

*Stopped for review — no commits made.*
