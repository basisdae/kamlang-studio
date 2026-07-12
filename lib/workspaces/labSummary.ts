/**
 * Lab Workspace summary — recipes / ingredients only.
 * Never pulls Opening readiness or bi_assets checklist.
 */

import { getAllIngredients } from "../../app/ingredients/IngredientRepository";
import { getStandardRecipeCost } from "../../app/lib/costService";
import { getBuilderSavedRecipes } from "../../app/repositories/SavedRecipeRepository";
import { getAllRecipes } from "../../app/recipes/RecipeRepository";

export type LabSummary = {
  recipeCount: number;
  standardCount: number;
  savedCount: number;
  ingredientCount: number;
  latestRecipeName: string | null;
  latestRecipeAt: string | null;
  noCostCount: number;
  incompleteCount: number;
};

export function buildLabSummary(): LabSummary {
  const standard = getAllRecipes();
  const saved = getBuilderSavedRecipes();
  const ingredients = getAllIngredients();

  const standardNoCost = standard.filter(
    (r) => getStandardRecipeCost(r) <= 0 || r.lines.length === 0
  ).length;
  const savedNoCost = saved.filter((r) => r.totalCost <= 0).length;
  const incomplete =
    saved.filter((r) => !r.menuName.trim() || r.ingredients.length === 0)
      .length + standard.filter((r) => r.status === "ยังไม่ครบ").length;

  let latestRecipeName: string | null = null;
  let latestRecipeAt: string | null = null;
  for (const r of saved) {
    const at = r.updatedAt || r.createdAt;
    if (!latestRecipeAt || at > latestRecipeAt) {
      latestRecipeAt = at;
      latestRecipeName = r.menuName.trim() || "สูตรไม่มีชื่อ";
    }
  }
  if (!latestRecipeName && standard[0]) {
    latestRecipeName = standard[0].name;
    latestRecipeAt = null;
  }

  return {
    recipeCount: standard.length + saved.length,
    standardCount: standard.length,
    savedCount: saved.length,
    ingredientCount: ingredients.length,
    latestRecipeName,
    latestRecipeAt,
    noCostCount: standardNoCost + savedNoCost,
    incompleteCount: incomplete,
  };
}
