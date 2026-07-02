import type { RecipeSeed, RecipeStatus } from "../../../recipes/types";
import {
  RECIPE_LINES_SCHEMA,
  RECIPES_HEADER_SCHEMA,
} from "../schema";
import type { ImportContext, ImportIssue, ImportResult } from "../types";
import {
  createEmptyResult,
  parseNumber,
  parsePipeList,
  readString,
  requireString,
} from "../utils";
import { getRowNumber, parseSheet, readWorkbook } from "../workbook";

const VALID_STATUSES = new Set<RecipeStatus>([
  "พร้อมใช้",
  "กำลังปรับ",
  "ยังไม่ครบ",
]);

type RecipeHeaderDraft = Omit<RecipeSeed, "lines">;

export function parseRecipesExcel(
  input: ArrayBuffer | Uint8Array,
  context?: ImportContext
): ImportResult<RecipeSeed> {
  const result = createEmptyResult<RecipeSeed>("recipes");
  const workbook = readWorkbook(input);

  const headerSheet = parseSheet(
    workbook,
    RECIPES_HEADER_SCHEMA.sheetName,
    RECIPES_HEADER_SCHEMA.columns
  );

  if (Array.isArray(headerSheet)) {
    result.errors.push(...headerSheet);
    return result;
  }

  const lineSheet = parseSheet(
    workbook,
    RECIPE_LINES_SCHEMA.sheetName,
    RECIPE_LINES_SCHEMA.columns
  );

  if (Array.isArray(lineSheet)) {
    result.errors.push(...lineSheet);
    return result;
  }

  const headersById = new Map<string, RecipeHeaderDraft>();
  const linesByRecipeId = new Map<string, RecipeSeed["lines"]>();

  headerSheet.rows.forEach((row, index) => {
    const rowNumber = getRowNumber(index);
    const rowErrors: ImportIssue[] = [];

    const idResult = requireString(rowNumber, row, "id", headerSheet.headerMap);
    const slugResult = requireString(rowNumber, row, "slug", headerSheet.headerMap);
    const nameResult = requireString(rowNumber, row, "name", headerSheet.headerMap);
    const categoryResult = requireString(rowNumber, row, "category", headerSheet.headerMap);
    const descriptionResult = requireString(rowNumber, row, "description", headerSheet.headerMap);
    const statusResult = requireString(rowNumber, row, "status", headerSheet.headerMap);
    const stepsRaw = requireString(rowNumber, row, "steps", headerSheet.headerMap);

    const yieldQuantityResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "yieldQuantity", headerSheet.headerMap).value ?? "",
      "yieldQuantity",
      { min: 0, allowZero: false }
    );
    const prepTimeResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "prepTimeMinutes", headerSheet.headerMap).value ?? "",
      "prepTimeMinutes",
      { min: 0 }
    );
    const cookTimeResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "cookTimeMinutes", headerSheet.headerMap).value ?? "",
      "cookTimeMinutes",
      { min: 0 }
    );
    const yieldUnitResult = requireString(rowNumber, row, "yieldUnit", headerSheet.headerMap);

    for (const item of [
      idResult,
      slugResult,
      nameResult,
      categoryResult,
      descriptionResult,
      statusResult,
      stepsRaw,
      yieldQuantityResult,
      prepTimeResult,
      cookTimeResult,
      yieldUnitResult,
    ]) {
      if (item.error) rowErrors.push(item.error);
    }

    if (rowErrors.length > 0) {
      result.errors.push(...rowErrors);
      result.failedCount += 1;
      return;
    }

    if (!VALID_STATUSES.has(statusResult.value! as RecipeStatus)) {
      result.errors.push({
        row: rowNumber,
        column: "status",
        message: `Invalid status "${statusResult.value}"`,
        code: "INVALID_STATUS",
      });
      result.failedCount += 1;
      return;
    }

    const steps = parsePipeList(stepsRaw.value!);

    if (steps.length === 0) {
      result.errors.push({
        row: rowNumber,
        column: "steps",
        message: 'At least one step is required (use "|" to separate steps)',
        code: "REQUIRED_FIELD",
      });
      result.failedCount += 1;
      return;
    }

    if (headersById.has(idResult.value!)) {
      result.errors.push({
        row: rowNumber,
        column: "id",
        message: `Duplicate recipe id "${idResult.value}"`,
        code: "DUPLICATE_ID",
      });
      result.failedCount += 1;
      return;
    }

    headersById.set(idResult.value!, {
      id: idResult.value!,
      slug: slugResult.value!,
      name: nameResult.value!,
      category: categoryResult.value!,
      description: descriptionResult.value!,
      yieldQuantity: yieldQuantityResult.value!,
      yieldUnit: yieldUnitResult.value!,
      prepTimeMinutes: prepTimeResult.value!,
      cookTimeMinutes: cookTimeResult.value!,
      status: statusResult.value! as RecipeStatus,
      steps,
    });
  });

  lineSheet.rows.forEach((row, index) => {
    const rowNumber = getRowNumber(index);
    const rowErrors: ImportIssue[] = [];

    const recipeIdResult = requireString(rowNumber, row, "recipeId", lineSheet.headerMap);
    const ingredientIdResult = requireString(
      rowNumber,
      row,
      "ingredientId",
      lineSheet.headerMap
    );
    const unitResult = requireString(rowNumber, row, "unit", lineSheet.headerMap);
    const quantityResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "quantity", lineSheet.headerMap).value ?? "",
      "quantity",
      { min: 0, allowZero: false }
    );

    for (const item of [recipeIdResult, ingredientIdResult, unitResult, quantityResult]) {
      if (item.error) rowErrors.push(item.error);
    }

    if (rowErrors.length > 0) {
      result.errors.push(...rowErrors);
      result.failedCount += 1;
      return;
    }

    if (!headersById.has(recipeIdResult.value!)) {
      result.errors.push({
        row: rowNumber,
        column: "recipeId",
        message: `recipeId "${recipeIdResult.value}" not found in recipes sheet`,
        code: "UNKNOWN_REFERENCE",
      });
      result.failedCount += 1;
      return;
    }

    if (
      context?.ingredientIds &&
      !context.ingredientIds.has(ingredientIdResult.value!)
    ) {
      result.errors.push({
        row: rowNumber,
        column: "ingredientId",
        message: `Unknown ingredientId "${ingredientIdResult.value}"`,
        code: "UNKNOWN_REFERENCE",
      });
      result.failedCount += 1;
      return;
    }

    const note = readString(row, "note", lineSheet.headerMap);
    const existing = linesByRecipeId.get(recipeIdResult.value!) ?? [];

    existing.push({
      ingredientId: ingredientIdResult.value!,
      quantity: quantityResult.value!,
      unit: unitResult.value!,
      note: note || undefined,
    });

    linesByRecipeId.set(recipeIdResult.value!, existing);
  });

  headersById.forEach((header, recipeId) => {
    const lines = linesByRecipeId.get(recipeId) ?? [];

    if (lines.length === 0) {
      result.errors.push({
        row: 1,
        column: "recipe_lines",
        message: `Recipe "${recipeId}" has no lines in recipe_lines sheet`,
        code: "MISSING_LINES",
      });
      result.failedCount += 1;
      return;
    }

    result.records.push({
      ...header,
      lines,
    });
    result.successCount += 1;
  });

  return result;
}
