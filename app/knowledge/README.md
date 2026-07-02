# Knowledge

Operational notes attached to master entities — storage, shelf life, supplier tips, etc.

## Relationship to master repositories

```
IngredientRepository ──┐
RecipeRepository     ──┼──► KnowledgeRepository.getKnowledge(type, id)
PackagingItemRepository┘
         (read-only lookup by entityType + entityId)
```

| Master repository | `entityType` | Example id |
|-------------------|--------------|------------|
| `IngredientRepository` | `ingredient` | `pork-mince` |
| `RecipeRepository` | `recipe` | `recipe-krapao-moo` |
| `PackagingItemRepository` | `packaging` | `pack-box-750ml` |

Knowledge is **optional** — `getKnowledge()` returns `undefined` when no card exists.

Master repositories are **unchanged**. Knowledge does not duplicate price, cost, or stock fields.

## Repository

`app/repositories/KnowledgeRepository.ts`

| Method | Purpose |
|--------|---------|
| `getKnowledge(entityType, id)` | Read card for one entity |
| `hasKnowledge(entityType, id)` | Check if card exists |
| `resetKnowledgeCache()` | Clear in-memory cache (tests) |

## Knowledge fields

| Field | Example use |
|-------|-------------|
| `storage` | แช่เย็น 0–4°C |
| `shelfLife` | ใช้ภายใน 2 วัน |
| `supplier` | ตลาดเช้า / ซัพพลายเนื้อ |
| `preparation` | คลุกเครื่องปรุงก่อนผัด |
| `warnings` | ห้ามทิ้งนอกตู้เย็น |
| `tips` | ซื้อเช้า แบ่งแพ็กล่วงหน้า |

All fields are optional strings.

## Seed data

`app/knowledge/seed.ts` — 7 example cards (3 ingredients, 2 recipes, 2 packaging items).

Validated on load: each `entityId` must exist in the matching master repository.

## Future (not in V1)

- UI knowledge cards on detail screens
- CRUD / editor
- User JSON import alongside `app/data/user/`
- Menu knowledge (เมนูขาย)
