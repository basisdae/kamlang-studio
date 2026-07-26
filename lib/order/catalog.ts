/**
 * Order menu catalog — read-only.
 *
 * No bi_products / bi_menus / customer sellable SKUs exist yet.
 * Opening bi_assets and kitchen demo menus are the wrong domain — do not reuse.
 * Returns empty until a real sellable catalog is wired.
 */

import type { OrderProduct } from "./types";

export type OrderCatalogResult = {
  products: OrderProduct[];
  /** Why the shelf is empty — owner-facing, no schema jargon in UI prefer short */
  emptyReason: string | null;
  /** Dev / handoff detail */
  missingForCatalog: string[];
};

export async function loadOrderCatalog(): Promise<OrderCatalogResult> {
  return {
    products: [],
    emptyReason: "ยังไม่มีรายการสินค้าสำหรับสั่งออนไลน์",
    missingForCatalog: [
      "รายการไส้/สินค้าขาย (ตั้งเตา) พร้อมชื่อแสดงผล",
      "ราคาขายต่อชิ้น (บาท)",
      "รูปสินค้า (URL หรือ storage)",
      "สถานะขาย/หมด (sold out)",
      "ตารางหรือแหล่ง Shared Core สำหรับเมนูสั่งออนไลน์ (ยังไม่มี bi_products / bi_menus)",
    ],
  };
}
