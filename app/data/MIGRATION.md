# KL Builder — Data Migration V1

Prepare master data for replacing demo content with real restaurant data.

**Repositories are unchanged.** Only `seed.ts` loaders read from `app/data/`.

---

## Data layers

| Layer | Location | Purpose |
|-------|----------|---------|
| **Demo** | `app/data/demo/*.json` | Bundled sample restaurant (default) |
| **User master** | `app/data/user/*.json` | Import-ready files for real data |
| **Runtime user** | `localStorage` via `Saved*Repository` | Builder drafts, plans, adjustments |

### Switch data source

```bash
# .env.local
NEXT_PUBLIC_KL_DATA_SOURCE=user
```

| Value | Behavior |
|-------|----------|
| `demo` (default) | Load `app/data/demo/*.json` |
| `user` | Load `app/data/user/*.json` |

After switching to `user`, fill JSON files under `app/data/user/` before running the app.

---

## Repositories

### Read-only master data (seed → repository)

| Repository | Seed loader | JSON file(s) |
|------------|-------------|--------------|
| `IngredientRepository` | `ingredients/seed.ts` | `ingredients.json` |
| `RecipeRepository` | `recipes/seed.ts` | `recipes.json` |
| `PackagingItemRepository` | `packaging/itemSeed.ts` | `packaging-items.json` |
| `PackagingSetRepository` | `packaging/setSeed.ts` | `packaging-sets.json` |
| `PackagingRepository` | `packaging/seed.ts` | *(adapter from items)* |
| `MenuRepository` | `menu/seed.ts` | `menus.json` |
| `ProductionRepository` | `production/seed.ts` | `production.json` |
| `InventoryRepository` | `inventory/seed.ts` | `inventory.json` |

### Runtime persistence (localStorage — separate from import)

| Repository | Key | Purpose |
|------------|-----|---------|
| `SavedRecipeRepository` | `kl-builder-recipes` | Recipe builder drafts |
| `SavedMenuRepository` | `kl-builder-menus` | Menu builder saves |
| `SavedProductionRepository` | `kl-production-plans`, `kl-production-hidden-dates` | Edited / new plans |
| `SavedPurchaseRepository` | `kl-purchase-states` | Shopping checkboxes |
| `SavedInventoryRepository` | `kl-inventory-adjustments` | Stock overrides |

---

## Import order (required)

Load master data in this order — each layer references the previous:

```
1. ingredients.json
2. packaging-items.json
3. packaging-sets.json   → references packaging-items
4. recipes.json          → references ingredients
5. menus.json            → references recipes + packaging-sets
6. inventory.json        → references ingredients
7. production.json       → references menus
```

---

## JSON schemas

### 1. `ingredients.json`

Array of ingredient master records.

```json
[
  {
    "id": "pork-mince",
    "name": "หมูสับ",
    "purchaseUnit": "kg",
    "purchasePrice": 180,
    "supplier": "ตลาด",
    "stockQuantity": 3.5,
    "minQuantity": 2
  }
]
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable slug, unique |
| `name` | string | yes | Display name |
| `purchaseUnit` | string | yes | `kg` \| `g` \| `liter` \| `ml` \| `piece` \| `pack` \| `bunch` |
| `purchasePrice` | number | yes | Price per purchase unit (THB) |
| `supplier` | string | yes | Source label (import metadata) |
| `stockQuantity` | number | yes | Opening stock (also seeds inventory if not overridden) |
| `minQuantity` | number | yes | Low-stock threshold |

---

### 2. `recipes.json`

Array of standard recipes (สูตรอาหาร).

```json
[
  {
    "id": "recipe-krapao-moo",
    "slug": "krapao-moo",
    "name": "กะเพราหมู",
    "category": "เมนูขายดี",
    "description": "สูตรมาตรฐานกะเพราหมู 1 ที่",
    "yieldQuantity": 1,
    "yieldUnit": "ที่",
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 5,
    "status": "พร้อมใช้",
    "lines": [
      { "ingredientId": "pork-mince", "quantity": 80, "unit": "g" }
    ],
    "steps": ["ผัดพริกกระเทียมให้หอม", "ใส่หมูสับ ผัดจนสุก"]
  }
]
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Unique |
| `slug` | string | yes | URL slug, unique |
| `name` | string | yes | |
| `category` | string | yes | |
| `description` | string | yes | |
| `yieldQuantity` | number | yes | |
| `yieldUnit` | string | yes | |
| `prepTimeMinutes` | number | yes | |
| `cookTimeMinutes` | number | yes | |
| `status` | string | yes | `พร้อมใช้` \| `กำลังปรับ` \| `ยังไม่ครบ` |
| `lines` | array | yes | Each line needs `ingredientId`, `quantity`, `unit`; `note` optional |
| `steps` | string[] | yes | Cooking steps |

---

### 3. `packaging-items.json`

Array of packaging materials.

```json
[
  {
    "id": "pack-box-750ml",
    "name": "กล่อง 750 ml",
    "category": "กล่อง",
    "cost": 4,
    "unit": "ใบ",
    "active": true
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `id` | string | yes |
| `name` | string | yes |
| `category` | string | yes |
| `cost` | number | yes (≥ 0) |
| `unit` | string | yes |
| `active` | boolean | yes |

---

### 4. `packaging-sets.json`

Array of channel bundles (Grab, ทานร้าน, etc.).

```json
[
  {
    "id": "pack-set-grab",
    "name": "Grab",
    "description": "บรรจุภัณฑ์สำหรับออเดอร์ Grab",
    "items": ["pack-box-750ml", "pack-plastic-spoon"]
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `id` | string | yes |
| `name` | string | yes |
| `description` | string | yes |
| `items` | string[] | yes — PackagingItem ids |

---

### 5. `menus.json`

Array of sellable menus (เมนูขาย).

```json
[
  {
    "id": "menu-krapao-sap-over-rice",
    "recipeId": "recipe-krapao-moo-sap",
    "name": "กะเพราหมูสับราดข้าว",
    "category": "จานเดียว",
    "packagingSetId": "pack-set-dine-in",
    "sellingPrice": 69,
    "isActive": true,
    "notes": "เสิร์ฟราดบนข้าวสวยร้อน"
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `id` | string | yes |
| `recipeId` | string | yes — must exist in recipes |
| `name` | string | yes |
| `category` | string | yes |
| `packagingSetId` | string | optional |
| `sellingPrice` | number | yes |
| `isActive` | boolean | yes |
| `notes` | string | optional |

---

### 6. `production.json`

Array of production plans (แผนผลิต).

```json
[
  {
    "id": "plan-2026-07-02",
    "date": "2026-07-02",
    "status": "preparing",
    "lines": [
      { "menuId": "menu-pork-burger", "quantity": 25, "note": "Grab" }
    ]
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `id` | string | yes — unique |
| `date` | string | yes — `YYYY-MM-DD` |
| `status` | string | yes — `draft` \| `preparing` \| `completed` |
| `lines` | array | yes — each: `menuId`, `quantity` (> 0), `note` optional |
| `deducted` | boolean | optional |
| `deductedAt` | string | optional — ISO timestamp |

Demo only: use `"date": "__TODAY__"` and `"id": "plan-__TODAY__"` — resolved at runtime.

---

### 7. `inventory.json`

Array of stock balances (สต๊อก).

```json
[
  {
    "ingredientId": "pork-mince",
    "stockQuantity": 3.5,
    "unit": "kg",
    "minQuantity": 2,
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
]
```

| Field | Type | Required |
|-------|------|----------|
| `ingredientId` | string | yes — must exist in ingredients |
| `stockQuantity` | number | yes (≥ 0) |
| `unit` | string | yes — ingredient unit |
| `minQuantity` | number | yes (≥ 0) |
| `updatedAt` | string | yes — ISO timestamp |

---

## Import bundle (all-in-one)

Use `import-bundle.template.json` as a starting point. Full shape:

```json
{
  "version": 1,
  "exportedAt": "2026-07-02T12:00:00.000Z",
  "ingredients": [],
  "recipes": [],
  "packagingItems": [],
  "packagingSets": [],
  "menus": [],
  "production": [],
  "inventory": []
}
```

TypeScript type: `KlImportBundle` in `app/data/types.ts`.

To migrate from bundle → per-file user data, split each array into the matching `app/data/user/*.json` file.

---

## Migration path

### Phase 1 — Prepare (this task) ✅

- Demo data moved to `app/data/demo/`
- Empty user templates in `app/data/user/`
- Seed loaders support `demo` \| `user` switch
- JSON schemas documented

### Phase 2 — Fill user data (manual)

1. Export from Excel / existing system
2. Map columns to JSON schemas above
3. Write files to `app/data/user/` (or split from import bundle)
4. Validate import order and foreign-key references
5. Set `NEXT_PUBLIC_KL_DATA_SOURCE=user`
6. Clear browser localStorage (or migrate Saved* data separately)

### Phase 3 — Import UI (future, not built yet)

- File upload → validate → write `app/data/user/*.json` or API
- Preview + conflict resolution
- Optional: migrate localStorage Saved* data

### Phase 4 — Backend (future)

- Replace JSON files with API / database
- Keep same repository interfaces; change seed loaders to fetch

---

## Validation rules (enforced by repositories)

Repositories validate on load:

- Unique ids per collection
- Foreign keys must resolve (recipe → ingredient, menu → recipe, etc.)
- Numeric fields must be finite and ≥ 0 where applicable
- Production: one menu per plan line, quantity > 0

Invalid user JSON will throw at startup — fix the file and restart.

---

## Quick reference

```
app/data/
  config.ts              # demo | user switch
  loadDataset.ts           # loader helper
  types.ts                 # KlImportBundle type
  demo/                    # bundled demo JSON
  user/                    # import targets (empty by default)
    import-bundle.template.json
    _examples/             # copy-paste samples
  MIGRATION.md             # this file
```

See `app/data/demo/` for working examples of every entity.
