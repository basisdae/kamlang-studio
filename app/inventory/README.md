# Inventory Domain

Current stock balance per ingredient — separate from ingredient master data.

## Concepts

| Concept | Thai | Repository | Description |
|---------|------|------------|-------------|
| **Ingredient** | วัตถุดิบ | `IngredientRepository` | Master data (name, price, units) |
| **Inventory Item** | สต็อกคงเหลือ | `InventoryRepository` | Current stock balance |

## Data flow

```
IngredientRepository (master data)
        ↓
InventoryRepository (stock balances)
```

## Relationship

- **Ingredient = master data** — name, category, purchase price, units. Does not change when stock moves.
- **Inventory = current balance** — `stockQuantity`, `minQuantity`, `unit`, `updatedAt` per `ingredientId`.
- **One inventory row per ingredient** — keyed by `ingredientId`, validated against `IngredientRepository` on load.

## Status helpers

| Status | Condition |
|--------|-----------|
| `out` | `stockQuantity <= 0` |
| `low` | `stockQuantity <= minQuantity` (and > 0) |
| `active` | `stockQuantity > minQuantity` |

Use `getInventoryStatus(item)` from `utils.ts`.

## Example

| Ingredient | Stock | Min | Status |
|------------|-------|-----|--------|
| หมูสับ | 3.5 kg | 2 | active |
| ไข่ไก่ | 0 piece | 12 | out |
| พริกกระเทียม | 0.8 kg | 1 | low |

## Files

| File | Role |
|------|------|
| `types.ts` | InventoryItem model |
| `seed.ts` | Stock seeded from Ingredient data |
| `utils.ts` | Status helpers |
| `InventoryRepository.ts` | Read-only queries |

## Persistence (Adjust V1)

Stock adjustments are stored in LocalStorage (`kl-inventory-adjustments`), keyed by `ingredientId`:

- `stockQuantity`, `minQuantity` — override seed balances
- `note` — optional adjustment note

Ingredient master data is unchanged. Production does not deduct stock yet.
- **IngredientRepository unchanged** — remains source of ingredient master data.
- **ingredientId validated on load** — must exist in IngredientRepository.
