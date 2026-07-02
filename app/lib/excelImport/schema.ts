import type { ImportSchema } from "./types";

export const INGREDIENTS_SCHEMA: ImportSchema = {
  entity: "ingredients",
  sheetName: "ingredients",
  columns: [
    { key: "id", required: true },
    { key: "name", required: true },
    { key: "purchaseUnit", required: true, aliases: ["purchase_unit", "unit"] },
    { key: "purchasePrice", required: true, aliases: ["purchase_price", "price"] },
    { key: "supplier", required: true },
    { key: "stockQuantity", required: true, aliases: ["stock_quantity", "stock"] },
    { key: "minQuantity", required: true, aliases: ["min_quantity", "min"] },
  ],
};

export const PACKAGING_SCHEMA: ImportSchema = {
  entity: "packaging",
  sheetName: "packaging",
  columns: [
    { key: "id", required: true },
    { key: "name", required: true },
    { key: "category", required: true },
    { key: "cost", required: true },
    { key: "unit", required: true },
    { key: "active", required: true },
  ],
};

export const RECIPES_HEADER_SCHEMA: ImportSchema = {
  entity: "recipes",
  sheetName: "recipes",
  columns: [
    { key: "id", required: true },
    { key: "slug", required: true },
    { key: "name", required: true },
    { key: "category", required: true },
    { key: "description", required: true },
    { key: "yieldQuantity", required: true, aliases: ["yield_quantity"] },
    { key: "yieldUnit", required: true, aliases: ["yield_unit"] },
    { key: "prepTimeMinutes", required: true, aliases: ["prep_time_minutes", "prep_time"] },
    { key: "cookTimeMinutes", required: true, aliases: ["cook_time_minutes", "cook_time"] },
    { key: "status", required: true },
    { key: "steps", required: true },
  ],
};

export const RECIPE_LINES_SCHEMA: ImportSchema = {
  entity: "recipes",
  sheetName: "recipe_lines",
  columns: [
    { key: "recipeId", required: true, aliases: ["recipe_id"] },
    { key: "ingredientId", required: true, aliases: ["ingredient_id"] },
    { key: "quantity", required: true },
    { key: "unit", required: true },
    { key: "note", required: false },
  ],
};

export const MENUS_SCHEMA: ImportSchema = {
  entity: "menus",
  sheetName: "menus",
  columns: [
    { key: "id", required: true },
    { key: "recipeId", required: true, aliases: ["recipe_id"] },
    { key: "name", required: true },
    { key: "category", required: true },
    { key: "packagingSetId", required: false, aliases: ["packaging_set_id"] },
    { key: "sellingPrice", required: true, aliases: ["selling_price", "price"] },
    { key: "isActive", required: true, aliases: ["is_active", "active"] },
    { key: "notes", required: false },
  ],
};

export const IMPORT_SCHEMAS = {
  ingredients: INGREDIENTS_SCHEMA,
  packaging: PACKAGING_SCHEMA,
  recipesHeader: RECIPES_HEADER_SCHEMA,
  recipeLines: RECIPE_LINES_SCHEMA,
  menus: MENUS_SCHEMA,
} as const;
