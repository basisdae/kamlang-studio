/**
 * Global business settings shared across the application.
 *
 * Persisted via SettingsRepository (localStorage).
 * Services read these values in future tasks — not wired yet.
 *
 * @see app/settings/README.md
 */

export type KlCurrencyCode = "THB" | "USD" | string;

export type KlLanguageCode = "th" | "en" | string;

/**
 * Restaurant / store identity — foundation for future multi-store support.
 * Persisted inside KlSettings.business (localStorage).
 */
export type KlBusinessProfile = {
  businessName: string;
  /** Restaurant category e.g. อาหารตามสั่ง */
  restaurantType: string;
  owner: string;
  /** Logo reference (URL or local path). Empty when unset. */
  logo: string;
  phone: string;
  address: string;
  currency: KlCurrencyCode;
  language: KlLanguageCode;
};

/** @deprecated Use KlBusinessProfile */
export type KlBusinessSettings = KlBusinessProfile;

export type KlPricingSettings = {
  /** Target gross profit % on selling price (กำไร %). */
  defaultGpPercent: number;
  defaultVatPercent: number;
  labourCostPerPortion: number;
  gasCostPerPortion: number;
  electricityCostPerPortion: number;
};

export type KlRecipeSettings = {
  defaultPortion: number;
  defaultYield: number;
};

export type KlInventorySettings = {
  /** Default minimum stock when an item has no explicit min. */
  lowStockThreshold: number;
};

export type KlPackagingSettings = {
  /** Extra margin % applied on packaging cost (future use). */
  defaultPackagingMargin: number;
};

export type KlSetupSettings = {
  /** Set when the user completes first-time setup. */
  completedAt: string | null;
};

export type KlSettings = {
  business: KlBusinessProfile;
  pricing: KlPricingSettings;
  recipe: KlRecipeSettings;
  inventory: KlInventorySettings;
  packaging: KlPackagingSettings;
  setup: KlSetupSettings;
  updatedAt: string;
};

export type KlSettingsPatch = {
  business?: Partial<KlBusinessProfile>;
  pricing?: Partial<KlPricingSettings>;
  recipe?: Partial<KlRecipeSettings>;
  inventory?: Partial<KlInventorySettings>;
  packaging?: Partial<KlPackagingSettings>;
  setup?: Partial<KlSetupSettings>;
};
