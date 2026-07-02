import { getAllIngredients } from "../ingredients/IngredientRepository";
import {
  parseIngredientsExcel,
  parseMenusExcel,
  parsePackagingExcel,
  parseRecipesExcel,
} from "../lib/excelImport";
import type { ImportContext, ImportResult } from "../lib/excelImport";
import { getAllPackagingSets } from "../packaging/PackagingSetRepository";
import { getAllRecipes } from "../recipes/RecipeRepository";
import type { ImportUiType } from "./types";

export function buildImportContext(type: ImportUiType): ImportContext | undefined {
  if (type === "recipes") {
    return {
      ingredientIds: new Set(getAllIngredients().map((item) => item.id)),
    };
  }

  if (type === "menus") {
    return {
      recipeIds: new Set(getAllRecipes().map((item) => item.id)),
      packagingSetIds: new Set(getAllPackagingSets().map((item) => item.id)),
    };
  }

  return undefined;
}

export function runImportParser(
  type: ImportUiType,
  buffer: ArrayBuffer
): ImportResult<unknown> {
  const context = buildImportContext(type);

  switch (type) {
    case "ingredients":
      return parseIngredientsExcel(buffer, context);
    case "packaging":
      return parsePackagingExcel(buffer, context);
    case "recipes":
      return parseRecipesExcel(buffer, context);
    case "menus":
      return parseMenusExcel(buffer, context);
    default:
      return parseIngredientsExcel(buffer, context);
  }
}

export function formatImportIssue(issue: {
  row: number;
  column?: string;
  message: string;
}): string {
  const column = issue.column ? ` (${issue.column})` : "";

  return `แถว ${issue.row}${column}: ${issue.message}`;
}
