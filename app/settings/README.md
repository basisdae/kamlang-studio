# Settings

Global business configuration for KL Builder.

## Repository

`app/repositories/SettingsRepository.ts`

| Method | Purpose |
|--------|---------|
| `getSettings()` | Read merged settings (saved + defaults) |
| `getBusinessProfile()` | Read business profile (`KlBusinessProfile`) |
| `updateSettings(patch)` | Merge, validate, persist |
| `updateBusinessProfile(patch)` | Merge, validate, persist business profile only |
| `resetSettings()` | Restore seeded defaults |

**localStorage key:** `kl-settings`

## Structure

```ts
KlSettings {
  business: KlBusinessProfile { businessName, owner, logo, phone, address, currency, language }
  pricing: { defaultGpPercent, defaultVatPercent, labour/gas/electricity per portion }
  recipe: { defaultPortion, defaultYield }
  inventory: { lowStockThreshold }
  packaging: { defaultPackagingMargin }
  updatedAt
}
```

Defaults live in `seed.ts`.

## How services will use settings (future)

| Service | Settings used |
|---------|---------------|
| `costService` | `pricing.defaultGpPercent` → suggested price |
| `menuCostService` | `pricing.*` per-portion overhead |
| `recipes/builder/utils` | `pricing.defaultGpPercent` |
| Recipe builder | `recipe.defaultPortion`, `recipe.defaultYield` |
| `inventoryAccess` | `inventory.lowStockThreshold` |
| Packaging cost rollup | `packaging.defaultPackagingMargin` |
| App shell / formatting | `business.currency`, `business.language`, `business.businessName` |

**Not wired in V1** — repositories and calculations unchanged until a follow-up task explicitly connects them.

## Defaults

| Field | Default | Notes |
|-------|---------|-------|
| `defaultGpPercent` | 65 | ≈ 35% food cost target |
| `defaultVatPercent` | 7 | Thailand VAT |
| `currency` | THB | |
| `language` | th | |
| `defaultPortion` / `defaultYield` | 1 | |
| `lowStockThreshold` | 1 | Default min stock |
| `defaultPackagingMargin` | 0 | % on packaging cost |
