export type IngredientCategory =
  | "Base"
  | "Protein"
  | "Vegetable"
  | "Sauce"
  | "Packaging"
  | "Other";

export type Ingredient = {
  id?: string;
  name: string;
  category?: IngredientCategory;
  icon?: string;
  amount: number;
  unit: string;
  costPerUnit: number;
};