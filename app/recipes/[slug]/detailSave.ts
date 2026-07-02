import {
  createSavedRecipe,
  getSavedRecipeById,
  STANDARD_DETAIL_DRAFT_PREFIX,
  updateSavedRecipe,
} from "../../repositories/SavedRecipeRepository";
import type { SavedRecipe, RecipeLine } from "../builder/types";
import type { LineOverride } from "./scaling";
import type { DisplayRecipeLine } from "./scaling";

export const DETAIL_DRAFT_ID_PREFIX = STANDARD_DETAIL_DRAFT_PREFIX;

export function getDetailDraftId(recipeId: string) {
  return `${DETAIL_DRAFT_ID_PREFIX}${recipeId}`;
}

export type DetailDraftState = {
  batchSize: number;
  overrides: Record<number, LineOverride>;
};

export function loadDetailDraft(recipeId: string): DetailDraftState | null {
  const draft = getSavedRecipeById(getDetailDraftId(recipeId));
  return draft?.detailState ?? null;
}

export function saveDetailDraft({
  recipeId,
  recipeName,
  recipeCategory,
  batchSize,
  overrides,
  displayLines,
  ingredientCost,
  suggestedPrice,
}: {
  recipeId: string;
  recipeName: string;
  recipeCategory: string;
  batchSize: number;
  overrides: Record<number, LineOverride>;
  displayLines: DisplayRecipeLine[];
  ingredientCost: number;
  suggestedPrice: number;
}) {
  const draftId = getDetailDraftId(recipeId);
  const existing = getSavedRecipeById(draftId);
  const now = new Date().toISOString();

  const ingredients: RecipeLine[] = displayLines.map((line) => ({
    ingredientId: line.ingredientId,
    name: line.name,
    quantity: line.quantity,
    unit: line.unit,
    cost: line.cost,
    note: line.note,
  }));

  const draft: SavedRecipe = {
    id: draftId,
    menuName: recipeName,
    category: recipeCategory,
    ingredients,
    totalCost: ingredientCost,
    suggestedPrice,
    profit: suggestedPrice - ingredientCost,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    detailState: {
      batchSize,
      overrides,
    },
  };

  if (existing) {
    updateSavedRecipe(draft);
  } else {
    createSavedRecipe(draft);
  }

  return true;
}
