/**
 * Semantic Colors V2 — meaning over decoration.
 *
 * Allowed accents:
 * - Heroes: navy (`kl-hero`)
 * - Notifications: burgundy (`kl-notification-*`)
 * - Ingredient categories: soft chips (`kl-cat-*`)
 *
 * Cards stay white. Module props are kept for API stability but do not add color.
 */
export type ModuleAccent =
  | "home"
  | "ingredients"
  | "recipes"
  | "menus"
  | "production"
  | "purchase"
  | "inventory"
  | "today";

export type IngredientCategoryKey =
  | "meat"
  | "vegetable"
  | "seasoning"
  | "frozen"
  | "dryGoods"
  | "beverage"
  | "packaging"
  | "other";

const INGREDIENT_CATEGORY_ALIASES: Record<string, IngredientCategoryKey> = {
  protein: "meat",
  meat: "meat",
  เนื้อ: "meat",
  เนื้อสัตว์: "meat",
  vegetable: "vegetable",
  vegetables: "vegetable",
  ผัก: "vegetable",
  sauce: "seasoning",
  seasoning: "seasoning",
  ปรุง: "seasoning",
  เครื่องปรุง: "seasoning",
  frozen: "frozen",
  แช่: "frozen",
  แช่แข็ง: "frozen",
  staple: "dryGoods",
  dry: "dryGoods",
  drygoods: "dryGoods",
  แห้ง: "dryGoods",
  ของแห้ง: "dryGoods",
  beverage: "beverage",
  drink: "beverage",
  เครื่องดื่ม: "beverage",
  packaging: "packaging",
  บรรจุ: "packaging",
  บรรจุภัณฑ์: "packaging",
  other: "other",
  อื่น: "other",
};

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategoryKey, string> =
  {
    meat: "เนื้อสัตว์",
    vegetable: "ผัก",
    seasoning: "เครื่องปรุง",
    frozen: "แช่แข็ง",
    dryGoods: "ของแห้ง",
    beverage: "เครื่องดื่ม",
    packaging: "บรรจุภัณฑ์",
    other: "อื่นๆ",
  };

export function normalizeIngredientCategory(
  category: string
): IngredientCategoryKey {
  const normalized = category.trim().toLowerCase();

  if (INGREDIENT_CATEGORY_ALIASES[normalized]) {
    return INGREDIENT_CATEGORY_ALIASES[normalized];
  }

  for (const [alias, key] of Object.entries(INGREDIENT_CATEGORY_ALIASES)) {
    if (normalized.includes(alias)) {
      return key;
    }
  }

  return "other";
}

export function getIngredientCategoryClass(category: string) {
  return `kl-cat-${normalizeIngredientCategory(category)}`;
}

export function getIngredientCategoryLabel(category: string) {
  return INGREDIENT_CATEGORY_LABELS[normalizeIngredientCategory(category)];
}

/** @deprecated V2 — section titles use neutral bar only */
export function getModuleSectionClass(_module?: ModuleAccent) {
  return "";
}

/** @deprecated V2 — cards stay white */
export function getModuleSectionCardClass(_module?: ModuleAccent) {
  return "";
}

/** All module heroes use navy */
export function getModuleHeroClass(_module?: ModuleAccent) {
  return "kl-hero";
}

/** V2 — neutral icon well for all modules */
export function getModuleIconWellClass(_module?: ModuleAccent) {
  return "kl-icon-well";
}
