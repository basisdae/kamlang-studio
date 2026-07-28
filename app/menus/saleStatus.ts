/**
 * Sale status vs cost status — never conflate selling with recipe readiness.
 */

import { calculateMenuCost, type MenuCostBreakdown } from "../lib/menuCostService";
import { getEffectiveRecipeLines, getRecipeCostById } from "../recipes/recipeAccess";
import type { MenuSaleStatus, SavedMenu } from "./builder/types";

export type { MenuSaleStatus };

export type MenuCostStatus =
  | "calculated"
  | "no_recipe"
  | "incomplete_recipe"
  | "missing_prices";

export const SALE_STATUS_LABEL: Record<MenuSaleStatus, string> = {
  draft: "แบบร่าง",
  active: "เปิดขาย",
  closed: "ปิดขาย",
  archived: "เก็บถาวร",
};

export const COST_STATUS_LABEL: Record<MenuCostStatus, string> = {
  calculated: "คำนวณแล้ว",
  no_recipe: "ยังไม่มีสูตร",
  incomplete_recipe: "สูตรไม่สมบูรณ์",
  missing_prices: "วัตถุดิบบางรายการยังไม่มีราคา",
};

/** Normalize persisted menus (legacy isActive-only → saleStatus). */
export function normalizeSavedMenu(raw: SavedMenu): SavedMenu {
  const saleStatus: MenuSaleStatus =
    raw.saleStatus ?? (raw.isActive ? "active" : "draft");
  const recipeId =
    typeof raw.recipeId === "string" && raw.recipeId.trim()
      ? raw.recipeId.trim()
      : undefined;

  return {
    ...raw,
    recipeId,
    saleStatus,
    isActive: saleStatus === "active",
  };
}

export function getSaleStatus(menu: Pick<SavedMenu, "saleStatus" | "isActive">): MenuSaleStatus {
  return menu.saleStatus ?? (menu.isActive ? "active" : "draft");
}

export function withSaleStatus(
  menu: SavedMenu,
  saleStatus: MenuSaleStatus
): SavedMenu {
  return {
    ...menu,
    saleStatus,
    isActive: saleStatus === "active",
  };
}

export function resolveMenuCost(
  menu: Pick<SavedMenu, "recipeId" | "packagingSetId" | "sellingPrice">
): { status: MenuCostStatus; cost: MenuCostBreakdown | null } {
  const recipeId = menu.recipeId?.trim();
  if (!recipeId) {
    return { status: "no_recipe", cost: null };
  }

  const lines = getEffectiveRecipeLines(recipeId);
  if (!lines) {
    return { status: "incomplete_recipe", cost: null };
  }
  if (lines.lines.length === 0) {
    return { status: "incomplete_recipe", cost: null };
  }

  try {
    const recipeCost = getRecipeCostById(recipeId);
    if (!(recipeCost > 0) && lines.lines.length > 0) {
      // Has lines but zero cost → treat as missing ingredient prices
      return { status: "missing_prices", cost: null };
    }

    const priceForCalc = menu.sellingPrice > 0 ? menu.sellingPrice : 0.01;
    let cost = calculateMenuCost({
      recipeId,
      packagingSetId: menu.packagingSetId,
      sellingPrice: priceForCalc,
    });
    if (menu.sellingPrice <= 0) {
      cost = {
        ...cost,
        sellingPrice: 0,
        grossProfit: Number.NaN,
        grossProfitPercent: Number.NaN,
      };
    }
    return { status: "calculated", cost };
  } catch {
    return { status: "incomplete_recipe", cost: null };
  }
}

export function formatCostBaht(
  cost: MenuCostBreakdown | null,
  status: MenuCostStatus
): string {
  if (status !== "calculated" || !cost) return "—";
  const n = cost.totalCost;
  return Number.isInteger(n) ? `฿${n}` : `฿${n.toFixed(2)}`;
}

export function formatProfitDisplay(
  cost: MenuCostBreakdown | null,
  status: MenuCostStatus,
  sellingPrice: number
): { profit: string; gp: string } {
  if (status !== "calculated" || !cost || !(sellingPrice > 0)) {
    return { profit: "—", gp: "รอคำนวณ" };
  }
  if (!Number.isFinite(cost.grossProfit)) {
    return { profit: "—", gp: "รอคำนวณ" };
  }
  const profit = Number.isInteger(cost.grossProfit)
    ? `฿${cost.grossProfit}`
    : `฿${cost.grossProfit.toFixed(2)}`;
  return { profit, gp: `${cost.grossProfitPercent}%` };
}
