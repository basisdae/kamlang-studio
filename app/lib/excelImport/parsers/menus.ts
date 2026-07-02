import type { MenuSeed } from "../../../menu/types";
import { MENUS_SCHEMA } from "../schema";
import type { ImportContext, ImportResult } from "../types";
import {
  createEmptyResult,
  parseBoolean,
  parseNumber,
  readString,
  requireString,
} from "../utils";
import { getRowNumber, parseSheet, readWorkbook } from "../workbook";

export function parseMenusExcel(
  input: ArrayBuffer | Uint8Array,
  context?: ImportContext
): ImportResult<MenuSeed> {
  const result = createEmptyResult<MenuSeed>("menus");
  const workbook = readWorkbook(input);
  const parsed = parseSheet(workbook, MENUS_SCHEMA.sheetName, MENUS_SCHEMA.columns);

  if (Array.isArray(parsed)) {
    result.errors.push(...parsed);
    return result;
  }

  const seenIds = new Set<string>();

  parsed.rows.forEach((row, index) => {
    const rowNumber = getRowNumber(index);
    const rowErrors = [];

    const idResult = requireString(rowNumber, row, "id", parsed.headerMap);
    const recipeIdResult = requireString(rowNumber, row, "recipeId", parsed.headerMap);
    const nameResult = requireString(rowNumber, row, "name", parsed.headerMap);
    const categoryResult = requireString(rowNumber, row, "category", parsed.headerMap);
    const priceResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "sellingPrice", parsed.headerMap).value ?? "",
      "sellingPrice",
      { min: 0, allowZero: false }
    );
    const activeResult = parseBoolean(
      rowNumber,
      requireString(rowNumber, row, "isActive", parsed.headerMap).value ?? "",
      "isActive"
    );

    for (const item of [
      idResult,
      recipeIdResult,
      nameResult,
      categoryResult,
      priceResult,
      activeResult,
    ]) {
      if (item.error) rowErrors.push(item.error);
    }

    if (rowErrors.length > 0) {
      result.errors.push(...rowErrors);
      result.failedCount += 1;
      return;
    }

    if (seenIds.has(idResult.value!)) {
      result.errors.push({
        row: rowNumber,
        column: "id",
        message: `Duplicate id "${idResult.value}"`,
        code: "DUPLICATE_ID",
      });
      result.failedCount += 1;
      return;
    }

    if (
      context?.recipeIds &&
      !context.recipeIds.has(recipeIdResult.value!)
    ) {
      result.errors.push({
        row: rowNumber,
        column: "recipeId",
        message: `Unknown recipeId "${recipeIdResult.value}"`,
        code: "UNKNOWN_REFERENCE",
      });
      result.failedCount += 1;
      return;
    }

    const packagingSetId = readString(row, "packagingSetId", parsed.headerMap);

    if (
      packagingSetId &&
      context?.packagingSetIds &&
      !context.packagingSetIds.has(packagingSetId)
    ) {
      result.warnings.push({
        row: rowNumber,
        column: "packagingSetId",
        message: `packagingSetId "${packagingSetId}" not found in import context`,
        code: "UNKNOWN_REFERENCE",
      });
    }

    const notes = readString(row, "notes", parsed.headerMap);

    seenIds.add(idResult.value!);

    result.records.push({
      id: idResult.value!,
      recipeId: recipeIdResult.value!,
      name: nameResult.value!,
      category: categoryResult.value!,
      packagingSetId: packagingSetId || undefined,
      sellingPrice: priceResult.value!,
      isActive: activeResult.value!,
      notes: notes || undefined,
    });
    result.successCount += 1;
  });

  return result;
}
