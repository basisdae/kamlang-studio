import type { KlSettings } from "./types";

/**
 * Default settings for a new restaurant workspace.
 *
 * Aligned with current app assumptions:
 * - GP 65% ≈ food cost 35% (costService default)
 * - VAT 7% (Thailand)
 * - THB / Thai language
 */
export const defaultSettings: KlSettings = {
  business: {
    businessName: "",
    restaurantType: "",
    owner: "",
    logo: "",
    phone: "",
    address: "",
    currency: "THB",
    language: "th",
  },
  pricing: {
    defaultGpPercent: 65,
    defaultVatPercent: 7,
    labourCostPerPortion: 0,
    gasCostPerPortion: 0,
    electricityCostPerPortion: 0,
  },
  recipe: {
    defaultPortion: 1,
    defaultYield: 1,
  },
  inventory: {
    lowStockThreshold: 1,
  },
  packaging: {
    defaultPackagingMargin: 0,
  },
  setup: {
    completedAt: null,
  },
  updatedAt: "2026-01-01T00:00:00.000Z",
};
