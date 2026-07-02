/**
 * Home screen copy — natural restaurant language (display only).
 */
export const HOME_UI = {
  today: "งานวันนี้",
  nextStep: "ทำต่อ",
  production: {
    title: "แผนผลิตวันนี้",
    empty: "วันนี้ยังไม่ได้วางแผนผลิต",
    mustProduce: (count: number) => `วันนี้ต้องผลิต ${count} จาน`,
    viewPlan: "ดูแผน",
    createPlan: "วางแผน",
  },
  purchase: {
    title: "ซื้อของวันนี้",
    emptyNoPlan: "วางแผนผลิตก่อน แล้วจะบอกว่าต้องซื้ออะไร",
    emptyNothing: "วันนี้ไม่ต้องซื้อเพิ่ม",
    boughtAll: "ซื้อครบแล้ว",
    remaining: (count: number) => `เหลือซื้ออีก ${count} รายการ`,
    goBuy: "ไปซื้อของ",
  },
  stock: {
    title: "ของใกล้หมด",
    checkStock: "ดูของที่เหลือ",
    out: "หมด",
    low: "ใกล้หมด",
  },
  setup: {
    title: "ตั้งร้านให้พร้อมเปิด",
    hint: "ใส่ชื่อร้าน ประเภทร้าน สกุลเงิน และเป้ากำไรก่อนเริ่มใช้",
    action: "ไปตั้งค่าร้าน",
  },
  ready: "พร้อมเปิดร้าน",
} as const;
