/**
 * Excel import service — parse and validate only.
 *
 * Does not write to repositories. Returns ImportResult with row-level errors.
 *
 * @see app/lib/excelImport/README.md
 */
import { parseIngredientsExcel } from "./parsers/ingredients";
import { parseMenusExcel } from "./parsers/menus";
import { parsePackagingExcel } from "./parsers/packaging";
import { parseRecipesExcel } from "./parsers/recipes";
import type { ImportContext } from "./types";

export { parseIngredientsExcel } from "./parsers/ingredients";
export { parseMenusExcel } from "./parsers/menus";
export { parsePackagingExcel } from "./parsers/packaging";
export { parseRecipesExcel } from "./parsers/recipes";

export {
  IMPORT_SCHEMAS,
  INGREDIENTS_SCHEMA,
  MENUS_SCHEMA,
  PACKAGING_SCHEMA,
  RECIPE_LINES_SCHEMA,
  RECIPES_HEADER_SCHEMA,
} from "./schema";

export type {
  ImportContext,
  ImportEntityType,
  ImportIssue,
  ImportResult,
  ImportSchema,
} from "./types";

export { getSheetNames } from "./workbook";

/**
 * Suggested import order with accumulated ids for cross-reference checks.
 */
export function parseRestaurantWorkbook(
  input: ArrayBuffer | Uint8Array
) {
  const ingredients = parseIngredientsExcel(input);
  const packaging = parsePackagingExcel(input);

  const context: ImportContext = {
    ingredientIds: new Set(ingredients.records.map((item) => item.id)),
    packagingItemIds: new Set(packaging.records.map((item) => item.id)),
  };

  const recipes = parseRecipesExcel(input, context);

  const recipeContext: ImportContext = {
    ...context,
    recipeIds: new Set(recipes.records.map((item) => item.id)),
  };

  const menus = parseMenusExcel(input, recipeContext);

  return {
    ingredients,
    packaging,
    recipes,
    menus,
  };
}
