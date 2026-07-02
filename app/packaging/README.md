# Packaging Domain

Reusable supplies for serving and takeaway, organized by sales channel.

## Concepts

| Concept | Thai | Repository | Description |
|---------|------|------------|-------------|
| **Ingredient** | วัตถุดิบ | `IngredientRepository` | Food inputs with cost |
| **Recipe** | สูตรมาตรฐาน | `RecipeRepository` | How a dish is made |
| **PackagingItem** | วัสดุบรรจุภัณฑ์ | `PackagingItemRepository` | Single material (กล่อง, ช้อน) |
| **PackagingSet** | ชุดบรรจุภัณฑ์ | `PackagingSetRepository` | Channel bundle (Grab, LINE MAN) |
| **Menu** | เมนูขาย | `MenuRepository` | Sellable product with price |

## Data flow

```
IngredientRepository
        ↓
RecipeRepository
        ↓
PackagingItemRepository
        ↓
PackagingSetRepository
        ↓
MenuRepository (future — packagingSetId per channel)
```

## V2 model

**PackagingItem** — one material with unit cost.

**PackagingSet** — named bundle for a sales channel. References item ids in `items[]`.

Example sets: Grab, LINE MAN, รับเอง, ทานร้าน.

## Files

| File | Role |
|------|------|
| `types.ts` | PackagingItem, PackagingSet models |
| `itemSeed.ts` | Item seed data |
| `setSeed.ts` | Set seed data |
| `seed.ts` | V1 adapter for legacy PackagingRepository |
| `PackagingItemRepository.ts` | Load and query items |
| `PackagingSetRepository.ts` | Load and query sets |
| `PackagingRepository.ts` | V1 read-only API (unchanged) |

## Rules

- **Read-only** — no CRUD until explicitly added.
- **Sets validate items** — every `items[]` entry must exist in PackagingItemRepository.
- **Reusable items** — one PackagingItem can appear in many PackagingSets.
- **Menu link (future)** — Menu will reference a PackagingSet per channel, not a single packagingId.
