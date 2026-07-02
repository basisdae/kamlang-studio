# Recipes Domain

Standard Recipe architecture for KL Builder.

## Concepts

| Concept | Thai | Repository | Description |
|---------|------|------------|-------------|
| **Ingredient** | วัตถุดิบ | `IngredientRepository` | Purchasable items with cost and stock |
| **Standard Recipe** | สูตรมาตรฐาน | `RecipeRepository` | How a dish is made — lines, yield, steps |
| **Menu** | เมนู | *(future)* | Sellable items with selling price |
| **Builder Draft** | แบบร่าง | `SavedRecipeRepository` | Experimental recipes from Builder UI |

## Data flow

```
IngredientRepository
        ↓
RecipeRepository (Standard Recipes)
        ↓
Menu (future — selling price lives here)
        ↓
SavedRecipeRepository (Builder Workspace)
```

## Files

| File | Role |
|------|------|
| `types.ts` | Standard Recipe model |
| `seed.ts` | Read-only seed data |
| `RecipeRepository.ts` | Load and query standard recipes |
| `builder/` | Builder UI workspace (SavedRecipe) |

## Rules

- **Recipe has no selling price** — cost only, derived from ingredient lines.
- **RecipeRepository is read-only** — no CRUD until explicitly added.
- **Builder drafts are separate** — `SavedRecipe` in LocalStorage is not a Standard Recipe.
- **`/recipes` lists Standard Recipes** from `RecipeRepository` (read-only).
- **Builder drafts** are accessed only via `SavedRecipeRepository` in the Builder UI.

## Costing

`app/lib/costService.ts` calculates standard recipe food cost via `IngredientRepository`.

Use `getSuggestedSellingPrice()` for reference pricing until Menu exists.
