/**
 * Lifecycle status for builder SavedRecipe (localStorage).
 * Separate from standard RecipeStatus ("พร้อมใช้" | "กำลังปรับ" | "ยังไม่ครบ").
 */

import type { BadgeTone } from "../../../components/ui/Badge";
import type { SavedRecipe, SavedRecipeLifecycleStatus } from "./types";

export const SAVED_RECIPE_STATUS_LABEL: Record<
  SavedRecipeLifecycleStatus,
  string
> = {
  draft: "แบบร่าง",
  experimenting: "กำลังทดลอง",
  ready: "พร้อมนำไปใช้",
  imported: "นำเข้าเมนูแล้ว",
  archived: "เก็บถาวร",
};

export const SAVED_RECIPE_STATUS_TONE: Record<
  SavedRecipeLifecycleStatus,
  BadgeTone
> = {
  draft: "draft",
  experimenting: "inProgress",
  ready: "ready",
  imported: "completed",
  archived: "neutral",
};

export const SAVED_RECIPE_STATUS_FILTERS: {
  id: SavedRecipeLifecycleStatus | "all" | "active";
  label: string;
}[] = [
  { id: "active", label: "ใช้งาน" },
  { id: "all", label: "ทั้งหมด" },
  { id: "draft", label: "แบบร่าง" },
  { id: "experimenting", label: "กำลังทดลอง" },
  { id: "ready", label: "พร้อมนำไปใช้" },
  { id: "imported", label: "นำเข้าเมนูแล้ว" },
  { id: "archived", label: "เก็บถาวร" },
];

/** Old records without status → แบบร่าง (backward compatible). */
export function normalizeSavedRecipeStatus(
  recipe: Pick<SavedRecipe, "status">
): SavedRecipeLifecycleStatus {
  return recipe.status ?? "draft";
}

export function formatSavedRecipeStatus(
  recipe: Pick<SavedRecipe, "status">
): string {
  return SAVED_RECIPE_STATUS_LABEL[normalizeSavedRecipeStatus(recipe)];
}
