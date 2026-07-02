import { getSettings } from "../repositories/SettingsRepository";

/** Food cost % target derived from GP % on selling price. */
export function getTargetFoodCostPercent(): number {
  const gp = getSettings().pricing.defaultGpPercent;
  return Math.max(1, Math.min(99, 100 - gp));
}

export function getDefaultGpPercent(): number {
  return getSettings().pricing.defaultGpPercent;
}

export type PerPortionCosts = {
  labourCost: number;
  gasCost: number;
  electricityCost: number;
};

/** Labour, gas, and electricity overhead per menu portion from settings. */
export function getPerPortionCosts(): PerPortionCosts {
  const pricing = getSettings().pricing;

  return {
    labourCost: pricing.labourCostPerPortion,
    gasCost: pricing.gasCostPerPortion,
    electricityCost: pricing.electricityCostPerPortion,
  };
}

/** Labour + gas + electricity overhead per menu portion. */
export function getPerPortionOverhead(): number {
  const { labourCost, gasCost, electricityCost } = getPerPortionCosts();

  return labourCost + gasCost + electricityCost;
}
