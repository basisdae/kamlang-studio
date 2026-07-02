import type { PackagingItemSeed } from "../../../packaging/types";
import { PACKAGING_SCHEMA } from "../schema";
import type { ImportContext, ImportResult } from "../types";
import { createEmptyResult, parseBoolean, parseNumber, requireString } from "../utils";
import { getRowNumber, parseSheet, readWorkbook } from "../workbook";

export function parsePackagingExcel(
  input: ArrayBuffer | Uint8Array,
  _context?: ImportContext
): ImportResult<PackagingItemSeed> {
  const result = createEmptyResult<PackagingItemSeed>("packaging");
  const workbook = readWorkbook(input);
  const parsed = parseSheet(workbook, PACKAGING_SCHEMA.sheetName, PACKAGING_SCHEMA.columns);

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
    const categoryResult = requireString(rowNumber, row, "category", parsed.headerMap);
    const unitResult = requireString(rowNumber, row, "unit", parsed.headerMap);
    const costResult = parseNumber(
      rowNumber,
      requireString(rowNumber, row, "cost", parsed.headerMap).value ?? "",
      "cost",
      { min: 0 }
    );
    const activeResult = parseBoolean(
      rowNumber,
      requireString(rowNumber, row, "active", parsed.headerMap).value ?? "",
      "active"
    );

    for (const item of [
      idResult,
      nameResult,
      categoryResult,
      unitResult,
      costResult,
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

    seenIds.add(idResult.value!);

    result.records.push({
      id: idResult.value!,
      name: nameResult.value!,
      category: categoryResult.value!,
      cost: costResult.value!,
      unit: unitResult.value!,
      active: activeResult.value!,
    });
    result.successCount += 1;
  });

  return result;
}
