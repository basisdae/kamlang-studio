# Excel Import Foundation V1

Parse and validate restaurant master data from Excel workbooks.

**Does not write to repositories.** Returns `ImportResult` with parsed records and row-level errors.

## Usage

```ts
import { parseIngredientsExcel } from "@/app/lib/excelImport";

const buffer = await file.arrayBuffer();
const result = parseIngredientsExcel(buffer);

if (result.failedCount > 0) {
  console.log(result.errors);
}
```

Full workbook (multi-sheet):

```ts
import { parseRestaurantWorkbook } from "@/app/lib/excelImport";

const { ingredients, packaging, recipes, menus } = parseRestaurantWorkbook(buffer);
```

## Workbook sheets

| Entity | Sheet name | Required columns |
|--------|------------|------------------|
| Ingredients | `ingredients` | id, name, purchaseUnit, purchasePrice, supplier, stockQuantity, minQuantity |
| Packaging | `packaging` | id, name, category, cost, unit, active |
| Recipes | `recipes` | id, slug, name, category, description, yieldQuantity, yieldUnit, prepTimeMinutes, cookTimeMinutes, status, steps |
| Recipe lines | `recipe_lines` | recipeId, ingredientId, quantity, unit, note (optional) |
| Menus | `menus` | id, recipeId, name, category, sellingPrice, isActive, packagingSetId (optional), notes (optional) |

### Column aliases

Headers are case-insensitive. Common aliases:

- `purchase_price` → `purchasePrice`
- `recipe_id` → `recipeId`
- `selling_price` → `sellingPrice`
- `is_active` → `isActive`

### Special formats

- **steps** — pipe-separated: `ผัดพริก|ใส่หมู|ใส่ใบกะเพรา`
- **active / isActive** — `true`, `false`, `1`, `0`, `yes`, `no`, `ใช่`, `ไม่`

## ImportResult

```ts
{
  entity: "ingredients",
  successCount: 8,
  failedCount: 1,
  warnings: [],
  errors: [{ row: 4, column: "purchasePrice", message: "...", code: "INVALID_NUMBER" }],
  records: [ /* validated objects ready for JSON / repository write */ ]
}
```

## Import order

```
ingredients → packaging → recipes (+ recipe_lines) → menus
```

Pass `ImportContext` with ids from earlier passes for cross-reference validation.

## JSON output example

See task review output — `records` matches `app/data/demo/*.json` shapes.
