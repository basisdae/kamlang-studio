# Production Domain

Daily kitchen production schedule — what menus to prepare and how many portions.

## Concepts

| Concept | Thai | Repository | Description |
|---------|------|------------|-------------|
| **Menu** | เมนูขาย | `MenuRepository` | Sellable product |
| **Production Plan** | แผนผลิต | `ProductionRepository` | Daily menu quantities |

## Data flow

```
IngredientRepository
        ↓
RecipeRepository
        ↓
MenuRepository (sellable products)
        ↓
ProductionRepository (daily plan)
```

## Relationship

- **Production references Menu** — each `ProductionLine.menuId` points to a Menu, not a Recipe.
- **One plan per date** — seed includes today's plan; `getPlanByDate()` looks up by `YYYY-MM-DD`.
- **Quantity = portions** — e.g. เบอร์เกอร์หมู x 25 means prepare 25 sellable units.

## Example

| Menu | Quantity |
|------|----------|
| เบอร์เกอร์หมู | 25 |
| แซนด์วิชไข่ | 18 |

## Files

| File | Role |
|------|------|
| `types.ts` | ProductionPlan, ProductionLine models |
| `seed.ts` | Read-only seed data (today's plan) |
| `ProductionRepository.ts` | Load and query plans |

## Rules

- **Read-only seeds** — no CRUD until explicitly added.
- **menuId validated on load** — must exist in MenuRepository.
- **Recipe is indirect** — resolve ingredients via Menu → Recipe when costing (future).

## Inventory deduction (V1)

When status changes to **เสร็จแล้ว** (`completed`):

1. Confirm dialog shows ingredient deduction preview
2. Stock is deducted from `kl-inventory-adjustments` via rollup
3. Saved plan marked `deducted: true` with `deductedAt`
4. Double deduction prevented — already-deducted plans skip deduction
5. Insufficient stock blocks deduction (no negative inventory)
