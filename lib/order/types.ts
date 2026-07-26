/**
 * Customer order surface types — Standalone /order (not BI Orders back-office).
 */

export type OrderFulfillment = "pickup" | "delivery";

/**
 * Pickup sub-mode collected in the customer order flow.
 * Optional on store order records for backward compatibility with older rows.
 */
export type PickupMode = "dine_wait" | "takeaway";

export type OrderProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  /** When true, add buttons are disabled */
  soldOut: boolean;
  category?: string;
  description?: string;
  /** True when real add-on options exist for this product */
  hasAddons?: boolean;
};

export type OrderAddon = {
  id: string;
  productId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string | null;
  soldOut: boolean;
  available: boolean;
};

export type CartAddonLine = {
  addonId: string;
  name: string;
  unitPrice: number;
  qty: number;
};

export type CartLine = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
  addons?: CartAddonLine[];
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
