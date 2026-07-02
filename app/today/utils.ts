import type { ProductionRollup } from "../lib/productionRollupService";
import { formatProductionQuantity } from "../production/utils";
import type { StaffPrepChecklistItem } from "./types";

export function staffMenuItemKey(menuId: string) {
  return `menu:${menuId}`;
}

export function staffIngredientItemKey(ingredientId: string, unit: string) {
  return `ingredient:${ingredientId}::${unit}`;
}

export function staffPackagingItemKey(packagingItemId: string) {
  return `packaging:${packagingItemId}`;
}

export function getStaffMenuItems(
  rollup: ProductionRollup
): StaffPrepChecklistItem[] {
  return rollup.menuLines.map((line) => ({
    key: staffMenuItemKey(line.menuId),
    name: line.menuName,
    quantityLabel: formatProductionQuantity(line.quantity),
    unitLabel: "จาน",
    note: line.note,
  }));
}

export function getStaffIngredientItems(
  rollup: ProductionRollup
): StaffPrepChecklistItem[] {
  return rollup.ingredientTotals.map((item) => ({
    key: staffIngredientItemKey(item.ingredientId, item.unit),
    name: item.name,
    quantityLabel: formatProductionQuantity(item.quantity),
    unitLabel: item.unit,
  }));
}

export function getStaffPackagingItems(
  rollup: ProductionRollup
): StaffPrepChecklistItem[] {
  return rollup.packagingTotals.map((item) => ({
    key: staffPackagingItemKey(item.packagingItemId),
    name: item.name,
    quantityLabel: formatProductionQuantity(item.quantity),
    unitLabel: item.unit,
  }));
}

export function getStaffPrepItemKeys(rollup: ProductionRollup) {
  return [
    ...getStaffMenuItems(rollup).map((item) => item.key),
    ...getStaffIngredientItems(rollup).map((item) => item.key),
    ...getStaffPackagingItems(rollup).map((item) => item.key),
  ];
}

export function countChecked(
  itemKeys: string[],
  checkedStates: Record<string, boolean>
) {
  return itemKeys.filter((key) => checkedStates[key]).length;
}
