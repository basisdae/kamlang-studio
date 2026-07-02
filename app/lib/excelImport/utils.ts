import type { ColumnDefinition, ImportIssue, ImportResult, SheetRow } from "./types";

export function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");
}

function headerMatches(column: ColumnDefinition, header: string): boolean {
  const normalized = normalizeHeader(header);
  const keys = [column.key, ...(column.aliases ?? [])].map(normalizeHeader);

  return keys.includes(normalized);
}

export function mapHeaders(
  headers: string[],
  columns: ColumnDefinition[]
): Record<string, string> | ImportIssue[] {
  const mapping: Record<string, string> = {};
  const usedHeaders = new Set<string>();
  const issues: ImportIssue[] = [];

  for (const column of columns) {
    const match = headers.find(
      (header) => header.trim() && headerMatches(column, header)
    );

    if (!match) {
      if (column.required) {
        issues.push({
          row: 1,
          column: column.key,
          message: `Missing required column "${column.key}"`,
          code: "MISSING_COLUMN",
        });
      }
      continue;
    }

    if (usedHeaders.has(match)) {
      issues.push({
        row: 1,
        column: column.key,
        message: `Duplicate header mapping for "${column.key}"`,
        code: "DUPLICATE_HEADER",
      });
      continue;
    }

    usedHeaders.add(match);
    mapping[column.key] = match;
  }

  return issues.length > 0 ? issues : mapping;
}

export function readString(
  row: SheetRow,
  columnKey: string,
  headerMap: Record<string, string>
): string {
  const header = headerMap[columnKey];
  if (!header) return "";

  return String(row[header] ?? "").trim();
}

export function requireString(
  rowNumber: number,
  row: SheetRow,
  columnKey: string,
  headerMap: Record<string, string>
): { value?: string; error?: ImportIssue } {
  const value = readString(row, columnKey, headerMap);

  if (!value) {
    return {
      error: {
        row: rowNumber,
        column: columnKey,
        message: `"${columnKey}" is required`,
        code: "REQUIRED_FIELD",
      },
    };
  }

  return { value };
}

export function parseNumber(
  rowNumber: number,
  raw: string,
  columnKey: string,
  options?: { min?: number; allowZero?: boolean }
): { value?: number; error?: ImportIssue } {
  const normalized = raw.replace(/,/g, "").trim();

  if (!normalized) {
    return {
      error: {
        row: rowNumber,
        column: columnKey,
        message: `"${columnKey}" must be a number`,
        code: "INVALID_NUMBER",
      },
    };
  }

  const value = Number(normalized);

  if (!Number.isFinite(value)) {
    return {
      error: {
        row: rowNumber,
        column: columnKey,
        message: `"${columnKey}" must be a valid number`,
        code: "INVALID_NUMBER",
      },
    };
  }

  const min = options?.min ?? 0;
  const allowZero = options?.allowZero ?? true;

  if (value < min || (!allowZero && value === 0)) {
    return {
      error: {
        row: rowNumber,
        column: columnKey,
        message: `"${columnKey}" must be >= ${allowZero ? min : Math.max(min, 1)}`,
        code: "NUMBER_OUT_OF_RANGE",
      },
    };
  }

  return { value };
}

export function parseBoolean(
  rowNumber: number,
  raw: string,
  columnKey: string
): { value?: boolean; error?: ImportIssue } {
  const normalized = raw.trim().toLowerCase();

  if (!normalized) {
    return {
      error: {
        row: rowNumber,
        column: columnKey,
        message: `"${columnKey}" must be true or false`,
        code: "INVALID_BOOLEAN",
      },
    };
  }

  if (["true", "1", "yes", "y", "ใช่", "active"].includes(normalized)) {
    return { value: true };
  }

  if (["false", "0", "no", "n", "ไม่", "inactive"].includes(normalized)) {
    return { value: false };
  }

  return {
    error: {
      row: rowNumber,
      column: columnKey,
      message: `"${columnKey}" must be true/false (got "${raw}")`,
      code: "INVALID_BOOLEAN",
    },
  };
}

export function parsePipeList(raw: string): string[] {
  if (!raw.trim()) return [];

  return raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isBlankRow(row: SheetRow): boolean {
  return Object.values(row).every((value) => !String(value ?? "").trim());
}

export function createEmptyResult<T>(entity: ImportResult<T>["entity"]): ImportResult<T> {
  return {
    entity,
    successCount: 0,
    failedCount: 0,
    warnings: [],
    errors: [],
    records: [],
  };
}
