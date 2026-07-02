import * as XLSX from "xlsx";
import type { ImportIssue, SheetRow } from "./types";
import { isBlankRow, mapHeaders, normalizeHeader } from "./utils";
import type { ColumnDefinition } from "./types";

export type ParsedSheet = {
  sheetName: string;
  headers: string[];
  headerMap: Record<string, string>;
  rows: SheetRow[];
};

export function readWorkbook(input: ArrayBuffer | Uint8Array) {
  return XLSX.read(input, { type: "array", cellDates: false });
}

export function getSheetNames(input: ArrayBuffer | Uint8Array): string[] {
  const workbook = readWorkbook(input);
  return workbook.SheetNames;
}

function sheetToMatrix(sheet: XLSX.WorkSheet): string[][] {
  return XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });
}

export function parseSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  columns: ColumnDefinition[]
): ParsedSheet | ImportIssue[] {
  const normalizedTarget = normalizeHeader(sheetName);
  const actualName = workbook.SheetNames.find(
    (name) => normalizeHeader(name) === normalizedTarget
  );

  if (!actualName) {
    return [
      {
        row: 1,
        message: `Missing sheet "${sheetName}"`,
        code: "MISSING_SHEET",
      },
    ];
  }

  const matrix = sheetToMatrix(workbook.Sheets[actualName]);

  if (matrix.length === 0) {
    return [
      {
        row: 1,
        message: `Sheet "${sheetName}" is empty`,
        code: "EMPTY_SHEET",
      },
    ];
  }

  const headers = matrix[0].map((cell) => String(cell ?? "").trim());
  const headerMapResult = mapHeaders(headers, columns);

  if (Array.isArray(headerMapResult)) {
    return headerMapResult;
  }

  const rows: SheetRow[] = [];

  for (let index = 1; index < matrix.length; index += 1) {
    const cells = matrix[index] ?? [];
    const row: SheetRow = {};

    headers.forEach((header, columnIndex) => {
      if (!header) return;
      row[header] = String(cells[columnIndex] ?? "").trim();
    });

    if (!isBlankRow(row)) {
      rows.push(row);
    }
  }

  return {
    sheetName: actualName,
    headers,
    headerMap: headerMapResult,
    rows,
  };
}

export function getRowNumber(dataRowIndex: number): number {
  return dataRowIndex + 2;
}
