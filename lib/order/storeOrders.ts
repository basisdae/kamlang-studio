/**
 * Store-facing orders queue — FIFO by server receivedAt.
 * No bi_orders yet: empty real load + optional trial samples for UX review only.
 */

export type StoreOrderStatus = "queued" | "in_progress" | "done" | "cancelled";

export type StoreOrderLine = {
  name: string;
  qty: number;
  addons?: { name: string; qty: number }[];
};

export type StoreOrder = {
  id: string;
  orderNumber: string;
  /** ISO timestamp — FIFO source of truth */
  receivedAt: string;
  fulfillment: "pickup" | "delivery";
  pickupMode?: "dine_wait" | "takeaway";
  nickname: string;
  phone: string;
  note?: string;
  lines: StoreOrderLine[];
  totalBaht: number;
  status: StoreOrderStatus;
  paymentLabel?: string;
  /** True = UX-only sample, not a real shop order */
  isTrialSample: boolean;
};

export type StoreOrdersResult = {
  orders: StoreOrder[];
  source: "empty" | "trial_samples";
  missingForOrders: string[];
};

const MISSING = [
  "ตารางออเดอร์จริง (เช่น bi_orders) พร้อม server timestamp",
  "เลขออเดอร์ / สถานะ / รายการ / Add-on / ยอดรวม",
  "Workflow Action จริงของครัว (ยังไม่มี Accept/Reject ในระบบ)",
];

/**
 * Trial-only samples for FIFO highlight UX — clearly not production data.
 * Sorted oldest → newest when used; never mixed as real catalog products.
 */
export const TRIAL_STORE_ORDERS: StoreOrder[] = [
  {
    id: "trial-1",
    orderNumber: "T-001",
    receivedAt: "2026-07-26T09:00:00.000Z",
    fulfillment: "pickup",
    pickupMode: "takeaway",
    nickname: "ตัวอย่าง ก",
    phone: "0800000001",
    lines: [{ name: "รายการทดลอง", qty: 2 }],
    totalBaht: 0,
    status: "queued",
    paymentLabel: "ทดลอง",
    isTrialSample: true,
    note: "โหมดทดลอง — ไม่ใช่ออเดอร์จริง",
  },
  {
    id: "trial-2",
    orderNumber: "T-002",
    receivedAt: "2026-07-26T09:05:00.000Z",
    fulfillment: "delivery",
    nickname: "ตัวอย่าง ข",
    phone: "0800000002",
    lines: [
      {
        name: "รายการทดลอง",
        qty: 1,
        addons: [{ name: "ตัวเลือกเพิ่ม (ทดลอง)", qty: 1 }],
      },
    ],
    totalBaht: 0,
    status: "queued",
    paymentLabel: "ทดลอง",
    isTrialSample: true,
  },
  {
    id: "trial-3",
    orderNumber: "T-003",
    receivedAt: "2026-07-26T09:12:00.000Z",
    fulfillment: "pickup",
    pickupMode: "dine_wait",
    nickname: "ตัวอย่าง ค",
    phone: "0800000003",
    lines: [{ name: "รายการทดลอง", qty: 3 }],
    totalBaht: 0,
    status: "queued",
    paymentLabel: "ทดลอง",
    isTrialSample: true,
  },
];

/** Oldest first (FIFO). Prefer server receivedAt — never client clock. */
export function sortOrdersFifo(orders: StoreOrder[]): StoreOrder[] {
  return [...orders].sort(
    (a, b) =>
      new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
  );
}

export async function loadStoreOrders(): Promise<StoreOrdersResult> {
  // Real bi_orders not wired — return trial samples for queue UX only.
  return {
    orders: sortOrdersFifo(TRIAL_STORE_ORDERS),
    source: "trial_samples",
    missingForOrders: MISSING,
  };
}
