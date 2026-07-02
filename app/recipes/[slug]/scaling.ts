import { getIngredientById } from "../../ingredients/IngredientRepository";
import { calcLineCost } from "../../ingredients/utils";
import type { RecipeLine } from "../types";

export type ScaledRecipeLine = {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  note?: string;
};

export type DisplayRecipeLine = ScaledRecipeLine & {
  lineIndex: number;
};

export type LineOverride = {
  quantity: number;
  unit: string;
  note?: string;
};

function formatDisplayQuantity(value: number) {
  if (Number.isInteger(value) || Math.abs(value - Math.round(value)) < 0.001) {
    return Math.round(value);
  }

  return Math.round(value * 10) / 10;
}

function toBaseQuantity(quantity: number, unit: string) {
  const normalized = unit.trim().toLowerCase();

  if (normalized === "kg") {
    return { quantity: quantity * 1000, unit: "g" };
  }

  if (normalized === "liter" || normalized === "l") {
    return { quantity: quantity * 1000, unit: "ml" };
  }

  return { quantity, unit };
}

export function computeLineCost(
  ingredientId: string,
  quantity: number,
  unit: string
) {
  const ingredient = getIngredientById(ingredientId);
  if (!ingredient) return 0;

  const base = toBaseQuantity(quantity, unit);
  return Math.round(calcLineCost(ingredient, base.quantity, base.unit));
}

/** Convert large g/ml amounts to kg/liter for display when appropriate. */
export function normalizeScaledUnit(quantity: number, unit: string) {
  const normalized = unit.trim().toLowerCase();
  const base = toBaseQuantity(quantity, unit);

  if (base.unit === "g" && base.quantity >= 1000) {
    return {
      quantity: formatDisplayQuantity(base.quantity / 1000),
      unit: "kg",
    };
  }

  if (base.unit === "ml" && base.quantity >= 1000) {
    return {
      quantity: formatDisplayQuantity(base.quantity / 1000),
      unit: "liter",
    };
  }

  return {
    quantity: formatDisplayQuantity(quantity),
    unit,
  };
}

export function scaleRecipeLine(
  line: RecipeLine,
  batchSize: number
): ScaledRecipeLine {
  const ingredient = getIngredientById(line.ingredientId);
  const rawQuantity = line.quantity * batchSize;
  const { quantity, unit } = normalizeScaledUnit(rawQuantity, line.unit);
  const cost = computeLineCost(line.ingredientId, rawQuantity, line.unit);

  return {
    ingredientId: line.ingredientId,
    name: ingredient?.name ?? "ไม่พบวัตถุดิบ",
    quantity,
    unit,
    cost,
    note: line.note,
  };
}

export function scaleRecipeLines(lines: RecipeLine[], batchSize: number) {
  return lines.map((line) => scaleRecipeLine(line, batchSize));
}

export function buildDisplayLine(
  line: RecipeLine,
  lineIndex: number,
  batchSize: number,
  override?: LineOverride
): DisplayRecipeLine {
  const ingredient = getIngredientById(line.ingredientId);
  const name = ingredient?.name ?? "ไม่พบวัตถุดิบ";

  if (override) {
    const { quantity, unit } = normalizeScaledUnit(
      override.quantity,
      override.unit
    );

    return {
      lineIndex,
      ingredientId: line.ingredientId,
      name,
      quantity,
      unit,
      cost: computeLineCost(line.ingredientId, override.quantity, override.unit),
      note: override.note?.trim() || undefined,
    };
  }

  const scaled = scaleRecipeLine(line, batchSize);

  return {
    lineIndex,
    ...scaled,
  };
}

export function buildDisplayLines(
  lines: RecipeLine[],
  batchSize: number,
  overrides: Record<number, LineOverride>
) {
  return lines.map((line, lineIndex) =>
    buildDisplayLine(line, lineIndex, batchSize, overrides[lineIndex])
  );
}

export function getScaledTotalCost(scaledLines: Pick<ScaledRecipeLine, "cost">[]) {
  return scaledLines.reduce((sum, line) => sum + line.cost, 0);
}
