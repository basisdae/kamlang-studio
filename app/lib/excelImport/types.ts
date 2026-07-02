/**
 * Excel import types — independent of repositories.
 *
 * @see app/lib/excelImport/README.md
 */

export type ImportEntityType =
  | "ingredients"
  | "recipes"
  | "packaging"
  | "menus";

export type ImportIssue = {
  row: number;
  column?: string;
  message: string;
  code: string;
};

export type ImportResult<T> = {
  entity: ImportEntityType;
  successCount: number;
  failedCount: number;
  warnings: ImportIssue[];
  errors: ImportIssue[];
  records: T[];
};

/** Optional ids from a prior import pass — cross-reference validation only. */
export type ImportContext = {
  ingredientIds?: Set<string>;
  recipeIds?: Set<string>;
  packagingItemIds?: Set<string>;
  packagingSetIds?: Set<string>;
};

export type SheetRow = Record<string, string>;

export type ColumnDefinition = {
  key: string;
  required: boolean;
  aliases?: string[];
};

export type ImportSchema = {
  entity: ImportEntityType;
  sheetName: string;
  columns: ColumnDefinition[];
};
