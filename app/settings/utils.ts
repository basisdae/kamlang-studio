import { defaultSettings } from "./seed";
import type { KlSettings, KlSettingsPatch } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeSection<T extends Record<string, unknown>>(
  base: T,
  patch?: Partial<T>
): T {
  if (!patch) return { ...base };

  return { ...base, ...patch };
}

/**
 * Merge saved settings with defaults so new fields always resolve.
 */
export function normalizeSettings(raw: unknown): KlSettings {
  if (!isRecord(raw)) {
    return { ...defaultSettings, updatedAt: defaultSettings.updatedAt };
  }

  return {
    business: mergeSection(
      defaultSettings.business,
      isRecord(raw.business)
        ? (raw.business as Partial<typeof defaultSettings.business>)
        : undefined
    ),
    pricing: mergeSection(
      defaultSettings.pricing,
      isRecord(raw.pricing)
        ? (raw.pricing as Partial<typeof defaultSettings.pricing>)
        : undefined
    ),
    recipe: mergeSection(
      defaultSettings.recipe,
      isRecord(raw.recipe)
        ? (raw.recipe as Partial<typeof defaultSettings.recipe>)
        : undefined
    ),
    inventory: mergeSection(
      defaultSettings.inventory,
      isRecord(raw.inventory)
        ? (raw.inventory as Partial<typeof defaultSettings.inventory>)
        : undefined
    ),
    packaging: mergeSection(
      defaultSettings.packaging,
      isRecord(raw.packaging)
        ? (raw.packaging as Partial<typeof defaultSettings.packaging>)
        : undefined
    ),
    setup: mergeSection(
      defaultSettings.setup,
      isRecord(raw.setup)
        ? (raw.setup as Partial<typeof defaultSettings.setup>)
        : undefined
    ),
    updatedAt:
      typeof raw.updatedAt === "string" && raw.updatedAt.trim()
        ? raw.updatedAt
        : defaultSettings.updatedAt,
  };
}

export function applySettingsPatch(
  current: KlSettings,
  patch: KlSettingsPatch
): KlSettings {
  return normalizeSettings({
    business: { ...current.business, ...patch.business },
    pricing: { ...current.pricing, ...patch.pricing },
    recipe: { ...current.recipe, ...patch.recipe },
    inventory: { ...current.inventory, ...patch.inventory },
    packaging: { ...current.packaging, ...patch.packaging },
    setup: { ...current.setup, ...patch.setup },
    updatedAt: new Date().toISOString(),
  });
}

function assertPercent(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${field} must be between 0 and 100`);
  }
}

function assertNonNegative(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a number >= 0`);
  }
}

function assertPositive(value: number, field: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${field} must be a number > 0`);
  }
}

function assertString(value: unknown, field: string) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }
}

export function validateSettings(settings: KlSettings): void {
  assertString(settings.business.businessName, "business.businessName");
  assertString(settings.business.restaurantType, "business.restaurantType");
  assertString(settings.business.owner, "business.owner");
  assertString(settings.business.logo, "business.logo");
  assertString(settings.business.phone, "business.phone");
  assertString(settings.business.address, "business.address");

  if (!settings.business.currency.trim()) {
    throw new Error("business.currency must not be empty");
  }

  if (!settings.business.language.trim()) {
    throw new Error("business.language must not be empty");
  }

  assertPercent(settings.pricing.defaultGpPercent, "pricing.defaultGpPercent");
  assertPercent(settings.pricing.defaultVatPercent, "pricing.defaultVatPercent");
  assertNonNegative(
    settings.pricing.labourCostPerPortion,
    "pricing.labourCostPerPortion"
  );
  assertNonNegative(settings.pricing.gasCostPerPortion, "pricing.gasCostPerPortion");
  assertNonNegative(
    settings.pricing.electricityCostPerPortion,
    "pricing.electricityCostPerPortion"
  );

  assertPositive(settings.recipe.defaultPortion, "recipe.defaultPortion");
  assertPositive(settings.recipe.defaultYield, "recipe.defaultYield");

  assertNonNegative(
    settings.inventory.lowStockThreshold,
    "inventory.lowStockThreshold"
  );

  assertPercent(
    settings.packaging.defaultPackagingMargin,
    "packaging.defaultPackagingMargin"
  );

  if (
    settings.setup.completedAt !== null &&
    typeof settings.setup.completedAt !== "string"
  ) {
    throw new Error("setup.completedAt must be a string or null");
  }
}

/** True after the user completes first-time setup. */
export function isSetupComplete(settings: KlSettings): boolean {
  return Boolean(settings.setup.completedAt?.trim());
}
