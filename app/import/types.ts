import type { ImportEntityType } from "../lib/excelImport";

export type ImportUiType = ImportEntityType;

export type ImportTypeOption = {
  id: ImportUiType;
  label: string;
  description: string;
  sheets: string[];
};

export const IMPORT_TYPE_OPTIONS: ImportTypeOption[] = [
  {
    id: "ingredients",
    label: "วัตถุดิบ",
    description: "แท็บ ingredients ในไฟล์ Excel",
    sheets: ["ingredients"],
  },
  {
    id: "recipes",
    label: "สูตรอาหาร",
    description: "แท็บ recipes และ recipe_lines ในไฟล์ Excel",
    sheets: ["recipes", "recipe_lines"],
  },
  {
    id: "packaging",
    label: "บรรจุภัณฑ์",
    description: "แท็บ packaging ในไฟล์ Excel",
    sheets: ["packaging"],
  },
  {
    id: "menus",
    label: "เมนูขาย",
    description: "แท็บ menus ในไฟล์ Excel",
    sheets: ["menus"],
  },
];
