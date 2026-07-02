/**
 * Production UI terminology (display copy only).
 *
 * - รายการสั่งล่วงหน้า — confirmed customer orders (kitchen / staff view)
 * - เป้าผลิต — production targets (owner plan view)
 * - ผลิตแล้ว — completed production / dishes made
 * - เตรียมแล้ว — prep done (ingredients, packaging)
 */
export const PRODUCTION_UI = {
  status: {
    draft: "แบบร่าง",
    preparing: "กำลังผลิต",
    completed: "เสร็จแล้ว",
  },
  sections: {
    targetsToday: "เป้าผลิตวันนี้",
    preOrders: "รายการสั่งล่วงหน้า",
    ingredientsToPrep: "ของที่ต้องเตรียม",
    packagingToPrep: "บรรจุภัณฑ์ที่ต้องเตรียม",
    productionStatus: "ขั้นตอนวันนี้",
  },
  progress: {
    prepared: "เตรียมแล้ว",
    produced: "ผลิตแล้ว",
    done: "ทำแล้ว",
    remaining: "ยังเหลือ",
  },
} as const;
