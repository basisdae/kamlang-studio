# 06 — Feature List

# Feature List

---

## Sprint 0 (shipped as UI foundation)

| Feature | Route | Status |
|---------|-------|--------|
| Overview home | `/` | Sample UI |
| Opening Plan hub | `/opening` | Sample UI |
| Budget + filters | `/opening/budget` | Sample UI |
| Assets | `/opening/assets` | Placeholder |
| Initial stock | `/opening/initial-stock` | Placeholder |
| Team | `/opening/team` | Sample UI |
| Checklist | `/opening/checklist` | Sample UI |
| Category detail | `/opening/categories/[id]` | Sample UI |
| Insight placeholder | `/insight` | Placeholder |
| Legacy kitchen home | `/today-ops` | Preserved |
| Desktop sidebar | — | Live |
| Mobile bottom nav | — | Live |
| BI design tokens | — | Live |

## Preserved from Kamlang Studio (Legacy)

| Feature | Route |
|---------|-------|
| Recipes | `/recipes`, `/recipes/builder`, `/recipes/[slug]` |
| Menus | `/menus` |
| Ingredients | `/ingredients` |
| Inventory | `/inventory` |
| Production plan | `/production` |
| Purchase list | `/purchase` |
| Staff today checklist | `/today` |
| Settings / backup | `/settings`, `/settings/data` |
| Search, import, costing, activity, notifications | respective routes |

## Phase 1+ (planned)

- Persist Opening Plan & Budget
- Team editing with 100% validation
- Asset CRUD linked to categories
- Investment module (เงินลงจริง / ROI) — separate from Budget
- Price comparison
- External POS / delivery sales import
- Drill-down Insight screens (no fake charts)

## Explicitly not building now

- POS / order taking
- Full accounting
- Auth / Supabase (until scheduled)
- Deleting legacy recipe/product systems
