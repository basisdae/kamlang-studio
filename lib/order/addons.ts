/**
 * Add-on catalog — read-only.
 * No real add-on table/API yet — return empty + missing fields.
 */

import type { OrderAddon } from "./types";

export type OrderAddonCatalogResult = {
  addons: OrderAddon[];
  emptyReason: string | null;
  missingForAddons: string[];
};

export async function loadOrderAddons(
  _productId: string
): Promise<OrderAddonCatalogResult> {
  return {
    addons: [],
    emptyReason: "ยังไม่มีตัวเลือกเพิ่มสำหรับสินค้านี้",
    missingForAddons: [
      "รายการ Add-on ที่ผูกกับสินค้าหลัก (ชื่อ / ราคาเพิ่ม)",
      "สถานะเปิดขายหรือหมดของ Add-on",
      "รูป Add-on (ถ้ามี)",
      "แหล่ง Shared Core สำหรับ add-ons (ยังไม่มี)",
    ],
  };
}
