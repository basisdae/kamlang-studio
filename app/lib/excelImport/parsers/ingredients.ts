import type { LegacyIngredientRecord } from "../../../ingredients/types";
import { INGREDIENTS_SCHEMA } from "../schema";
import type { ImportContext, ImportResult } from "../types";
import { createEmptyResult, parseNumber, requireString } from "../utils";
import { getRowNumber, parseSheet, readWorkbook } from "../workbook";

const VALID_UNITS = new Set([
  "kg",
  "g",
  "liter",
  "ml",
  "piece",
  "pack",
  "bunch",
]);

export function parseIngredientsExcel(
  input: ArrayBuffer | Uint8Array,
  _context?: ImportContext
): ImportResult<LegacyIngredientRecord> {
  const result = createEmptyResult<LegacyIngredientRecord>("ingredients");
  const workbook = readWorkbook(input);
  const parsed = parseSheet(workbook, INGREDIENTS_SCHEMA.sheetName, INGREDIENTS_SCHEMA.columns);

  if (Array.isArray(parsed)) {
    result.errors.push(...parsed);
    return result;
  }

  const seenIds = new Set<string>();

  parsed.rows.forEach((row, index) => {
    const rowNumber = getRowNumber(index);
    const rowErrors = [];

    const idResult = requireString(rowNumber, row, "id", parsed.headerMap);
    const nameResult = requireString(rowNumber, row, "name", parsed.headerMap);
    const unitResult = requireString(rowNumber, row, "purchaseUnit", parsed.headerMap);
    const supplierResult = requireString(rowNumber, row, "supplier", parsed.headerMap);

    const priceResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "purchasePrice", parsed.headerMap).value ?? "",
      "purchasePrice",
      { min: 0 }
    );
    const stockResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "stockQuantity", parsed.headerMap).value ?? "",
      "stockQuantity",
      { min: 0 }
    );
    const minResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "minQuantity", parsed.headerMap).value ?? "",
      "minQuantity",
      { min: 0 }
    );

    for (const item of [
      idResult,
      nameResult,
      unitResult,
      supplierResult,
      priceResult,
      stockResult,
      minResult,
    ]) {
      if (item.error) rowErrors.push(item.error);
    }

    if (rowErrors.length > 0) {
      result.errors.push(...rowErrors);
      result.failedCount += 1;
      return;
    }

    const purchaseUnit = unitResult.value!.toLowerCase();

    if (!VALID_UNITS.has(purchaseUnit)) {
      result.errors.push({
        row: rowNumber,
        column: "purchaseUnit",
        message: `Invalid purchaseUnit "${unitResult.value}"`,
        code: "INVALID_UNIT",
      });
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

    seenIds.add(idResult.value!);

    result.records.push({
      id: idResult.value!,
      name: nameResult.value!,
      purchaseUnit: purchaseUnit as LegacyIngredientRecord["purchaseUnit"],
      purchasePrice: priceResult.value!,
      supplier: supplierResult.value!,
      stockQuantity: stockResult.value!,
      minQuantity: minResult.value!,
    });
    result.successCount += 1;
  });

  return result;
}
