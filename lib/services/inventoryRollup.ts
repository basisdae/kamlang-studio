/**
 * Shared inventory rollup from live bi_assets (no seed).
 * Used by Budget / Assets summary consistency checks.
 */

import type { AssetStatus } from "../types/asset";
import { ASSET_STATUS_LABELS } from "../../data/seed/assets";

/** Minimal asset shape for rollup (domain or UI). */
export type InventoryAssetInput = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  status: AssetStatus;
  isArchived?: boolean;
  estimatedUnitPrice?: number | null;
  estimatedPrice?: number | null;
  actualUnitPrice?: number | null;
  actualPrice?: number | null;
};

export type InventoryLine = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number | null;
  lineTotal: number | null;
  status: AssetStatus;
  statusLabel: string;
};

export type InventoryBuckets = {
  allPriced: InventoryLine[];
  owned: InventoryLine[];
  need: InventoryLine[];
  noPrice: InventoryLine[];
  inventoryTotal: number;
  inventoryOwned: number;
  inventoryNeed: number;
  inventoryActualSpend: number;
  inventoryUnknownNeed: number;
  countAll: number;
  countOwned: number;
  countNeed: number;
  countNoPrice: number;
};

export function isInventoryOwned(status: AssetStatus) {
  return status === "in_use";
}

export function isInventoryNeed(status: AssetStatus) {
  return (
    status === "planned" ||
    status === "awaiting_quote" ||
    status === "ready_to_buy"
  );
}

export function isInventoryOrdered(status: AssetStatus) {
  return status === "ordered" || status === "awaiting_delivery";
}

function unitPriceOf(a: InventoryAssetInput): number | null {
  // Inventory uses estimated unit price (range → max already stored in DB).
  // Do not coerce null → 0.
  const estimated = a.estimatedUnitPrice ?? a.estimatedPrice ?? null;
  return estimated;
}

function toLine(a: InventoryAssetInput): InventoryLine {
  const unitPrice = unitPriceOf(a);
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    quantity: a.quantity,
    unit: a.unit,
    unitPrice,
    lineTotal: unitPrice == null ? null : unitPrice * a.quantity,
    status: a.status,
    statusLabel: ASSET_STATUS_LABELS[a.status],
  };
}

/** Active (non-archived) assets only — never include seed archived rows. */
export function buildInventoryBuckets(
  assets: InventoryAssetInput[]
): InventoryBuckets {
  const active = assets.filter((a) => !a.isArchived);
  const lines = active.map(toLine);

  const owned = lines.filter((l) => isInventoryOwned(l.status));
  const need = lines.filter((l) => isInventoryNeed(l.status));
  const noPrice = lines.filter((l) => l.unitPrice == null);
  const allPriced = lines.filter((l) => l.lineTotal != null);

  const sum = (rows: InventoryLine[]) =>
    rows.reduce((s, r) => s + (r.lineTotal ?? 0), 0);

  return {
    allPriced,
    owned,
    need,
    noPrice,
    inventoryTotal: sum(allPriced),
    inventoryOwned: sum(owned.filter((l) => l.lineTotal != null)),
    inventoryNeed: sum(need.filter((l) => l.lineTotal != null)),
    inventoryActualSpend: 0,
    inventoryUnknownNeed: need.filter((l) => l.unitPrice == null).length,
    countAll: active.length,
    countOwned: owned.length,
    countNeed: need.length,
    countNoPrice: noPrice.length,
  };
}
