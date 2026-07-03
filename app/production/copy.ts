/**
 * Production UI terminology (display copy only).
 */
export const PRODUCTION_UI = {
  status: {
    draft: "ยังไม่เริ่ม",
    preparing: "กำลังทำ",
    completed: "เสร็จแล้ว",
  },
  sections: {
    targetsToday: "เมนูที่ต้องทำวันนี้",
    preOrders: "รายการสั่งล่วงหน้า",
    ingredientsToPrep: "ของที่ต้องเตรียม",
    packagingToPrep: "ของห่อกลับบ้านที่ต้องเตรียม",
    productionStatus: "ขั้นตอนวันนี้",
  },
  progress: {
    prepared: "เตรียมแล้ว",
    produced: "ทำแล้ว",
    done: "ทำแล้ว",
    remaining: "ยังเหลือ",
  },
} as const;
