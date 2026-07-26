/**
 * Customer order surface types — Standalone /order (not BI Orders back-office).
 */

export type OrderFulfillment = "pickup" | "delivery";

/** Pickup-only sub-mode (no table number). */
export type PickupMode = "dine_wait" | "takeaway";

export type OrderProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  /** When true, add buttons are disabled */
  soldOut: boolean;
  category?: string;
};

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};

export type OrderSource = "customer" | "staff";

export type PickupCheckoutDraft = {
  nickname: string;
  phone: string;
};

export type DeliveryCheckoutDraft = {
  nickname: string;
  phone: string;
  address: string;
  note: string;
};
