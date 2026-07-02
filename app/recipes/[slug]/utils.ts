export function formatMoney(value: number) {
  return Number(value.toFixed(2)).toString();
}

const RECIPE_UNIT_LABELS: Record<string, string> = {
  g: "กรัม",
  kg: "กก.",
  ml: "มล.",
  l: "ลิตร",
  liter: "ลิตร",
  piece: "ชิ้น",
  egg: "ฟอง",
  sheet: "แผ่น",
  pack: "แพ็ก",
  bunch: "มัด",
};

/** Display-only Thai label for recipe line units on Recipe Detail. */
export function formatRecipeUnit(unit: string) {
  const normalized = unit.trim().toLowerCase();
  return RECIPE_UNIT_LABELS[normalized] ?? unit;
}

export function getStep(unit: string) {
  if (unit === "กรัม") return 5;
  return 1;
}

export function getQuantityStep(unit: string) {
  const normalized = unit.trim().toLowerCase();

  if (normalized === "g" || normalized === "ml") return 5;
  if (normalized === "kg" || normalized === "liter" || normalized === "l") {
    return 0.1;
  }

  return 1;
}

export function getEstimatedGpPercent(cost: number, sellingPrice: number) {
  if (sellingPrice <= 0) return 0;

  return Math.round(((sellingPrice - cost) / sellingPrice) * 100);
}
