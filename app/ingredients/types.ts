export type IngredientUnit =
  | "kg"
  | "g"
  | "liter"
  | "ml"
  | "piece"
  | "pack"
  | "bunch";

export type IngredientStatus = "active" | "low" | "out";

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  purchaseUnit: IngredientUnit;
  baseUnit: IngredientUnit;
  stockQuantity: number;
  minQuantity: number;
  stockUnit: IngredientUnit;
  status: IngredientStatus;
};

export type LegacyIngredientRecord = {
  id: string;
  name: string;
  purchaseUnit: IngredientUnit;
  purchasePrice: number;
  supplier: string;
  stockQuantity: number;
  minQuantity: number;
};
