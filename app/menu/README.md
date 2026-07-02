# Menu Domain

Sellable products derived from Standard Recipes.

## Concepts

| Concept | Thai | Repository | Description |
|---------|------|------------|-------------|
| **Ingredient** | วัตถุดิบ | `IngredientRepository` | Purchasable items with cost |
| **Recipe** | สูตรมาตรฐาน | `RecipeRepository` | How a dish is made |
| **Menu** | เมนู | `MenuRepository` | Sellable product with price |

## Data flow

```
IngredientRepository
        ↓
RecipeRepository (Standard Recipes)
        ↓
MenuRepository (Sellable Products)
```

## Examples

| Recipe | Menu items |
|--------|------------|
| กะเพราหมูสับ | กะเพราหมูสับราดข้าว, กะเพราหมูสับกับข้าว, กะเพราหมูสับ XL |
| เบอร์เกอร์หมู | เบอร์เกอร์หมู |
| แซนวิชไข่ | แซนด์วิชไข่ |

## Files

| File | Role |
|------|------|
| `types.ts` | Menu model |
| `seed.ts` | Read-only seed data |
| `MenuRepository.ts` | Load and query menu items |

## Rules

- **MenuRepository is read-only** — no CRUD until explicitly added.
- **Selling price belongs to Menu** — not on Recipe.
- **recipeId must reference a Standard Recipe** — validated on load.
- **packagingId is optional** — packaging domain not implemented yet.
