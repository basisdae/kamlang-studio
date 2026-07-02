/**
 * Standard Recipe domain types.
 *
 * A Recipe (สูตรมาตรฐาน) defines how a dish is made — ingredients, yield, steps.
 * Selling price belongs to Menu (future layer), not Recipe.
 *
 * @see app/recipes/README.md
 */
import type { IngredientUnit } from "../ingredients/types";

export type RecipeLine = {
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit | string;
  note?: string;
};

export type RecipeStatus = "พร้อมใช้" | "กำลังปรับ" | "ยังไม่ครบ";

/** Standard Recipe — kitchen reference, not a sellable menu item. */
export type Recipe = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  yieldQuantity: number;
  yieldUnit: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  lines: RecipeLine[];
  steps: string[];
  status: RecipeStatus;
};

export type RecipeSeed = Recipe;
