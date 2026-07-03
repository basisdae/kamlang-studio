import type { ImportEntityType } from "../lib/excelImport";

export type ImportUiType = ImportEntityType;

export type ImportTypeOption = {
  id: ImportUiType;
  label: string;
  description: string;
  sheets: string[];
  sheetLabels: string[];
};

export const IMPORT_TYPE_OPTIONS: ImportTypeOption[] = [
  {
    id: "ingredients",
    label: "วัตถุดิบ",
    description: "ตารางวัตถุดิบในไฟล์ Excel",
    sheets: ["ingredients"],
    sheetLabels: ["วัตถุดิบ"],
  },
  {
    id: "recipes",
    label: "สูตรอาหาร",
    description: "ตารางสูตรและรายการในสูตร",
    sheets: ["recipes", "recipe_lines"],
    sheetLabels: ["สูตร", "รายการในสูตร"],
  },
  {
    id: "packaging",
    label: "ของห่อกลับบ้าน",
    description: "ตารางถุง กล่อง ช้อน ในไฟล์ Excel",
    sheets: ["packaging"],
    sheetLabels: ["ของห่อกลับบ้าน"],
  },
  {
    id: "menus",
    label: "เมนูขาย",
    description: "ตารางเมนูขายในไฟล์ Excel",
    sheets: ["menus"],
    sheetLabels: ["เมนูขาย"],
  },
];
