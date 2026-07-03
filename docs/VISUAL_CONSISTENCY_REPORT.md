# Visual Consistency Audit Report

**Audit date:** July 2026  
**Lens:** Mobile-first (390px), same-app feel across all routes  
**Rules:** No business logic or calculation changes — spacing, typography, radius, shadows, buttons, icons only

---

## How to read this report

| Field | Meaning |
|-------|---------|
| **Problem** | Visual inconsistency observed |
| **Reason** | Why it breaks cohesion |
| **Fix** | Token or component applied |
| **Status** | `Implemented` or `Open` |

---

## Design system baseline (existing)

| Token / class | Purpose |
|---------------|---------|
| `--kl-radius`, `--kl-radius-inner`, `--kl-radius-btn`, `--kl-radius-sheet` | Card, nested panel, input, sheet corners |
| `--kl-shadow-soft`, `--kl-shadow-card`, `--kl-shadow-nav` | Elevation hierarchy |
| `--kl-card-padding` | Default card inner padding |
| `kl-type-*` | Typography scale (display → label) |
| `KL_ICON_CLASS`, `KL_ICON_STROKE` | Icon size and stroke |
| `kl-card`, `kl-input`, `kl-search`, `kl-inset` | Core surfaces |
| `AppShell` `space-y-7` | Default page section rhythm |

---

## New shared utilities (`app/globals.css`)

| Class | Purpose |
|-------|---------|
| `.kl-builder-scroll` | Standard bottom padding above fixed builder bars (`--kl-builder-scroll-pad: 11rem`) |
| `.kl-card-body` | Hero inner padding using `--kl-card-padding` |
| `.kl-upload-zone` | Dashed file-picker areas (import + backup) |
| `.kl-alert-danger` | Error / shortage callouts |
| `.kl-segment-btn` | Filter and status segmented controls |
| `.kl-nested-panel` | Nested form groups inside cards |
| `.kl-dropdown-panel` | Overflow menus (`--kl-shadow-nav`, not `shadow-lg`) |
| `.kl-surface-toggle` | Collapsible section headers (version history) |

---

## Cross-cutting fixes

### Typography

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Raw `text-sm`, `text-xs`, `font-bold` scattered in setup, import, version history | Mixed scale vs `kl-type-*` elsewhere | Migrated to `kl-type-helper`, `kl-type-label`, `kl-type-card-title`, `kl-type-caption` | **Implemented** |
| `SearchResultGroup` mixed heading sizes | Search felt like a different app | `kl-type-card-title` + `kl-type-helper` | **Implemented** |

### Spacing

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| `space-y-6` on production detail and search results | Tighter rhythm than other pages (`space-y-7`) | Unified to `space-y-7` | **Implemented** |
| `pb-40` / `pb-44` on builder pages | Magic numbers differed per route | `.kl-builder-scroll` on all builders + skeletons | **Implemented** |

### Radius & shadows

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| `rounded-2xl`, `rounded-xl`, `shadow-lg` overrides | Bypassed design tokens | Replaced with token utilities or removed redundant overrides on `Card` | **Implemented** |
| Skeleton placeholders used `rounded-2xl` | Didn't match real inputs (`--kl-radius-btn`) | `rounded-[var(--kl-radius-btn)]` / `--kl-radius-inner` | **Implemented** |

### Cards & surfaces

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Hero cards used raw `p-5` | Padding didn't match `--kl-card-padding` | `kl-card-body` on `MenuHero`, `RecipeHero` | **Implemented** |
| Danger states re-declared radius + padding on `Card` | Double-styling fought `kl-card` defaults | `kl-alert-danger` (import, settings/data, production deduct) | **Implemented** |
| Upload zones styled inline | Import vs backup looked different | `kl-upload-zone` on `ImportUploadCard`, `BackupRestoreCard` | **Implemented** |

### Buttons & controls

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Status / inventory filters used ad-hoc `rounded-xl px-2` | Segments didn't match production filter feel | `kl-segment-btn` on `ProductionStatusControl`, `InventoryFilterBar` | **Implemented** |
| Production overflow menu used `shadow-lg` | Heavier than nav dropdown standard | `kl-dropdown-panel` on `ProductionHeroActions` | **Implemented** |
| Undo toast used raw button styling | Toast actions didn't match `Button` component | `Button size="sm"` + `kl-type-caption` | **Implemented** |

---

## Per-area changes

### Builders (`/recipes/builder`, `/menus/new`, `/menus/[id]/edit`, `/production/edit`)

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Inconsistent scroll padding | Bottom bar overlapped content unevenly | `kl-builder-scroll` | **Implemented** |
| Production nested line editor inline border/padding | Didn't match menu builder nested groups | `kl-nested-panel` in `ProductionBuilderForm` | **Implemented** |
| Loading skeletons mirrored old padding/radius | Flash of wrong layout on load | Skeletons updated to match | **Implemented** |

### Import & data (`/import`, `/settings/data`)

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Parse error card custom danger styles | Different from setup/settings errors | `kl-alert-danger` | **Implemented** |
| Conflict sheet mixed font sizes | Sheet felt denser than other modals | `kl-type-*` + `kl-inset` rows | **Implemented** |
| Setup intro/helper cards extra radius/padding | Heavier than standard `Card` | Default `Card` + `kl-type-helper` | **Implemented** |
| Setup form fields didn't match settings | Two setup flows looked unrelated | `SetupForm` aligned with `SettingsForm` (`kl-input`, `SectionTitle`) | **Implemented** |

### Production (`/production`)

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Deducted banner over-styled | Redundant `rounded-2xl` on `Card` | Default `Card` + `bg-kl-surface` | **Implemented** |
| Deduct confirm shortage nested `Card` | Double card chrome | `kl-alert-danger` div | **Implemented** |

### Detail heroes (`/menus/[id]`, `/recipes/[slug]`)

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Inner hero padding `p-5` | Slightly off from global card padding | `kl-card-body` | **Implemented** |
| `AddIngredientSheet` custom search row | Didn't match app-wide `SearchBar` | `SearchBar` + `kl-nested-panel` list | **Implemented** |

### Version history

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Toggle button custom flex/radius | Different from other collapsible sections | `kl-surface-toggle` | **Implemented** |
| Version rows used raw bold/small text | Typography drift | `kl-caption`, `kl-type-card-title`, `kl-inset` | **Implemented** |

### Search (`/search`)

| Problem | Reason | Fix | Status |
|---------|--------|-----|--------|
| Result groups tighter vertical rhythm | Page felt cramped vs home/lists | `space-y-7` in `SearchResults` | **Implemented** |

---

## Files touched (summary)

**Global:** `app/globals.css`  
**Pages:** `setup/page.tsx`, `import/page.tsx`, `settings/data/page.tsx`, `production/page.tsx`, `recipes/builder/page.tsx`, `menus/new/page.tsx`, `menus/[id]/edit/page.tsx`, `production/edit/ProductionEditPageContent.tsx`  
**Components:** `BackupRestoreCard`, `ImportUploadCard`, `ImportConflictSheet`, `SetupForm`, `VersionHistoryPanel`, `ProductionHeroActions`, `ProductionStatusControl`, `ProductionBuilderForm`, `ProductionDeductedBanner`, `ProductionDeductConfirmSheet`, `InventoryFilterBar`, `MenuHero`, `RecipeHero`, `AddIngredientSheet`, `SearchResultGroup`, `SearchResults`, `UndoToastHost`  
**Skeletons:** `MenuBuilderPageSkeleton`, `ProductionBuilderPageSkeleton`, `ImportResultPanelSkeleton`

---

## Open items (low priority)

| Problem | Reason | Suggested follow-up | Status |
|---------|--------|---------------------|--------|
| `RecipeIngredients` row uses `rounded-[var(--kl-radius-btn)]` inline | Works but not a named utility | Optional `.kl-list-row` if pattern spreads | Open |
| Success message cards on settings/data use ad-hoc green text on `Card` | No `kl-alert-success` token yet | Add paired success utility if more success banners appear | Open |
| `SearchBar` inside sheet `Card` loses outer shadow context | Acceptable — search still reads clearly | No change unless sheets get dedicated search variant | Open |
| Activity timeline dot uses `top-5` magic offset | Minor; timeline is unique layout | Leave unless timeline is redesigned | Open |

---

## Verification

- `npm run build` — **passes** (Next.js 16.2.9, TypeScript clean)
- No business logic, pricing, or food-cost formulas modified
- No theme or palette changes

---

## Review checklist

Walk these routes on 390px width and confirm they feel like one app:

1. `/setup` → intro card, form fields, footer link typography  
2. `/import` → upload zone matches `/settings/data` backup zone  
3. `/settings/data` → danger restore errors  
4. `/production` → status segments, hero overflow menu shadow  
5. `/production/edit` → nested panels, bottom scroll clearance  
6. `/menus/new` and `/recipes/builder` → same bottom padding above save bar  
7. `/menus/[id]` and `/recipes/[slug]` → hero padding, version history toggle  
8. `/search` → result group typography and spacing  
9. `/inventory` → filter segments match production status control  

---

*Stopped for review — no commits made.*
