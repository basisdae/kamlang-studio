# Purchase Domain

Shopping list derived from production — ingredient quantities needed to fulfill a plan.

## Concepts

| Concept | Thai | Description |
|---------|------|-------------|
| **Production Plan** | แผนผลิต | Daily menu quantities |
| **Ingredient Rollup** | สรุปวัตถุดิบ | Aggregated ingredients from production |
| **Purchase List** | รายการซื้อ | Grouped ingredient purchase needs |

## Data flow

```
Production Plan
        ↓
ProductionRollupService (ingredient totals)
        ↓
PurchaseListService
        ↓
Purchase List
```

## Relationship

- **Purchase references Ingredient** — each `PurchaseListLine.ingredientId` points to an ingredient, not a menu or recipe.
- **Derived, not authored** — V1 builds the list from production rollup; no manual line entry yet.
- **Grouped by ingredient + unit** — same ingredient in different units stays as separate lines (matches rollup grouping).

## Example

Production: เบอร์เกอร์หมู × 25, แซนด์วิชไข่ × 18

Purchase list lines (abbreviated):

| Ingredient | Needed | Unit |
|------------|--------|------|
| pork-mince | 3000 | g |
| egg | 61 | piece |

## Files

| File | Role |
|------|------|
| `types.ts` | PurchaseList, PurchaseListLine models |
| `../lib/purchaseListService.ts` | Build list from production rollup |

## Rules

- **No UI in V1** — service layer only.
- **Production unchanged** — consumes rollup output, does not modify production.
- **Ingredients only** — packaging is not included in purchase list (V1).

## Persistence (Manage V1)

Shopping progress is stored in LocalStorage (`kl-purchase-states`), keyed by production plan date:

- `isBought` — checkbox state per ingredient line
- `note` — shopping note (e.g. ซื้อแล้ว 2 กก., ของหมด)

List lines are still generated from Production; only shopping state is persisted.

## Receive (V1)

From `/purchase`, checked items can be received into inventory:

- **รับเข้าสต็อก** — adds quantity to `kl-inventory-adjustments`
- Marks line `isReceived` in `kl-purchase-states`
- Skips already-received items unless user confirms repeat receive
