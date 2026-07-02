/**
 * Purchase domain types.
 *
 * A Purchase List is derived from Production ingredient rollup —
 * what ingredients to buy for a planned production day.
 *
 * @see app/purchase/README.md
 */
export type PurchaseListLine = {
  ingredientId: string;
  quantityNeeded: number;
  unit: string;
  note?: string;
};

export type PurchaseList = {
  id: string;
  planId: string;
  planDate: string;
  lines: PurchaseListLine[];
};

/** Persisted shopping progress for a purchase list line. */
export type SavedPurchaseLineState = {
  isBought: boolean;
  note: string;
  isReceived?: boolean;
  receivedAt?: string;
  /** Quantity received into inventory stock unit. */
  receivedQuantity?: number;
};

/** Persisted shopping session keyed by production plan date. */
export type SavedPurchaseState = {
  planDate: string;
  planId: string;
  lines: Record<string, SavedPurchaseLineState>;
  updatedAt: string;
};
