import type {
  Ingredient,
  IngredientStatus,
  IngredientUnit,
  LegacyIngredientRecord,
} from "./types";

const CATEGORY_BY_ID: Record<string, string> = {
  "pork-mince": "Protein",
  "holy-basil": "Vegetable",
  "chili-garlic": "Vegetable",
  "stir-fry-sauce": "Sauce",
  "rice-cooked": "Staple",
  egg: "Protein",
  "bread-slice": "Staple",
  "burger-bun": "Staple",
};

const STATUS_LABELS: Record<IngredientStatus, string> = {
  active: "พร้อมใช้",
  low: "ใกล้หมด",
  out: "หมด",
};

export function deriveBaseUnit(purchaseUnit: IngredientUnit): IngredientUnit {
  if (purchaseUnit === "kg") return "g";
  if (purchaseUnit === "liter") return "ml";
  return purchaseUnit;
}

export function deriveIngredientStatus(
  stockQuantity: number,
  minQuantity: number
): IngredientStatus {
  if (stockQuantity <= 0) return "out";
  if (stockQuantity <= minQuantity) return "low";
  return "active";
}

export function normalizeLegacyIngredient(
  record: LegacyIngredientRecord
): Ingredient {
  const baseUnit = deriveBaseUnit(record.purchaseUnit);

  return {
    id: record.id,
    name: record.name,
    category: CATEGORY_BY_ID[record.id] ?? "Other",
    purchasePrice: record.purchasePrice,
    purchaseUnit: record.purchaseUnit,
    baseUnit,
    stockQuantity: record.stockQuantity,
    minQuantity: record.minQuantity,
    stockUnit: record.purchaseUnit,
    status: deriveIngredientStatus(record.stockQuantity, record.minQuantity),
  };
}

export function calcLineCost(
  ingredient: Pick<Ingredient, "purchaseUnit" | "purchasePrice">,
  quantity: number,
  unit: string
) {
  if (ingredient.purchaseUnit === "kg" && unit === "g") {
    return (ingredient.purchasePrice / 1000) * quantity;
  }

  if (ingredient.purchaseUnit === "liter" && unit === "ml") {
    return (ingredient.purchasePrice / 1000) * quantity;
  }

  return ingredient.purchasePrice * quantity;
}

export function formatIngredientPrice(ingredient: Ingredient): string {
  return `฿${ingredient.purchasePrice} / ${ingredient.purchaseUnit}`;
}

export function getIngredientStatusLabel(status: IngredientStatus): string {
  return STATUS_LABELS[status];
}

export function getIngredientDisplayUnit(ingredient: Ingredient): IngredientUnit {
  return ingredient.baseUnit;
}

export function filterIngredients(ingredients: Ingredient[], search: string) {
  return ingredients.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
}

export function defaultUnitForIngredient(ingredient: Ingredient): IngredientUnit {
  return deriveBaseUnit(ingredient.purchaseUnit);
}
