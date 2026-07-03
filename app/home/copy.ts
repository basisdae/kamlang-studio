/**
 * Home screen copy — natural restaurant language (display only).
 */
export const HOME_UI = {
  focusLabel: "วันนี้ทำอะไร",
  today: "งานวันนี้",
  nextStep: "ทำต่อ",
  production: {
    title: "แผนวันนี้",
    empty: "วันนี้ยังไม่ได้วางแผน",
    mustProduce: (count: number) => `วันนี้ต้องทำ ${count} จาน`,
    viewPlan: "ดูแผน",
    createPlan: "วางแผนวันนี้",
    createHint: "เลือกเมนูที่จะทำวันนี้",
  },
  purchase: {
    title: "ซื้อของวันนี้",
    emptyNoPlan: "วางแผนวันนี้ก่อน แล้วจะบอกว่าต้องซื้ออะไร",
    emptyNothing: "วันนี้ไม่ต้องซื้อเพิ่ม",
    boughtAll: "ซื้อครบแล้ว",
    remaining: (count: number) => `เหลือซื้ออีก ${count} รายการ`,
    goBuy: "ไปซื้อของ",
  },
  stock: {
    title: "ของใกล้หมด",
    checkStock: "ดูของที่เหลือ",
    alert: (count: number) => `${count} รายการใกล้หมด`,
    out: "หมด",
    low: "ใกล้หมด",
  },
  kitchen: {
    open: "เปิดงานครัววันนี้",
    dishes: (count: number) => `${count} จานตามแผน`,
    noDishes: "ดูรายการที่ต้องเตรียม",
  },
  setup: {
    title: "ตั้งร้านให้พร้อมเปิด",
    hint: "ใส่ชื่อร้าน ประเภทร้าน และเป้ากำไรที่อยากได้",
    action: "ไปตั้งค่าร้าน",
  },
  ready: "พร้อมเปิดร้าน",
} as const;
