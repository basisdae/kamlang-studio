/**
 * Empty state copy — explain why, what next, action label.
 */
export const EMPTY_STATE = {
  recipes: {
    none: {
      title: "ยังไม่มีสูตรในรายการ",
      hint: "เริ่มสร้างสูตรเพื่อคำนวณต้นทุนและราคาขายแนะนำ",
      actionLabel: "สร้างสูตรใหม่",
      actionHref: "/recipes/builder",
    },
    search: {
      title: "ไม่พบสูตรที่ค้นหา",
      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",
      actionLabel: "ล้างคำค้นหา",
    },
  },
  menus: {
    none: {
      title: "ยังไม่มีเมนูขายของคุณ",
      hint: "ผูกสูตรกับราคาขายเพื่อใช้ในแผนผลิต",
      actionLabel: "สร้างเมนูขาย",
      actionHref: "/menus/new",
    },
    search: {
      title: "ไม่พบเมนูขายที่ค้นหา",
      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",
      actionLabel: "ล้างคำค้นหา",
    },
    notFound: {
      title: "ไม่พบเมนูขาย",
      hint: "เมนูนี้อาจถูกลบหรือไม่มีในระบบ",
      actionLabel: "กลับไปรายการเมนู",
      actionHref: "/menus",
    },
    editNotFound: {
      title: "แก้ไขเมนูนี้ไม่ได้",
      hint: "เป็นเมนูตัวอย่างหรือถูกลบไปแล้ว",
      actionLabel: "กลับไปรายการเมนู",
      actionHref: "/menus",
    },
    packaging: {
      title: "ยังไม่ได้กำหนดชุดบรรจุภัณฑ์",
      hint: "แก้ไขเมนูขายเพื่อเลือกชุดบรรจุภัณฑ์",
    },
  },
  ingredients: {
    none: {
      title: "ยังไม่มีวัตถุดิบในระบบ",
      hint: "โหลดจาก Excel หรือเพิ่มวัตถุดิบเมื่อพร้อม",
      actionLabel: "โหลดจาก Excel",
      actionHref: "/import",
    },
    search: {
      title: "ไม่พบวัตถุดิบที่ค้นหา",
      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",
      actionLabel: "ล้างคำค้นหา",
    },
  },
  inventory: {
    none: {
      title: "ยังไม่มีข้อมูลสต๊อก",
      hint: "โหลดจาก Excel หรือรับของเข้าหลังซื้อของ",
      actionLabel: "โหลดจาก Excel",
      actionHref: "/import",
    },
    search: {
      title: "ไม่พบวัตถุดิบที่ค้นหา",
      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",
      actionLabel: "ล้างคำค้นหา",
    },
    filter: {
      title: "ไม่มีรายการในหมวดนี้",
      hint: "ลองเปลี่ยนตัวกรองหรือดูทั้งหมด",
      actionLabel: "ดูทั้งหมด",
    },
  },
  purchase: {
    noPlan: {
      title: "ยังไม่มีรายการซื้อของวันนี้",
      hint: "สร้างแผนผลิตก่อน ระบบจะสรุปว่าต้องซื้ออะไร",
      actionLabel: "ไปวางแผนผลิต",
      actionHref: "/production",
    },
  },
  production: {
    noPlan: {
      title: "ยังไม่มีแผนผลิตวันนี้",
      hint: "กำหนดเมนูและจำนวนที่ต้องทำ ระบบจะคำนวณวัตถุดิบและรายการซื้อให้",
      actionLabel: "สร้างแผนผลิต",
    },
    packaging: {
      title: "ไม่มีบรรจุภัณฑ์ในแผนนี้",
      hint: "เมนูในแผนวันนี้ไม่ได้ใช้ชุดบรรจุภัณฑ์",
    },
  },
  today: {
    noPlan: {
      title: "ยังไม่มีงานครัววันนี้",
      hint: "รอเจ้าของร้านวางแผนผลิตก่อน",
      actionLabel: "ดูแผนผลิต",
      actionHref: "/production",
    },
    packaging: {
      title: "ไม่มีบรรจุภัณฑ์ในแผนวันนี้",
      hint: "เมนูวันนี้ไม่ได้ใช้ชุดบรรจุภัณฑ์",
    },
  },
  search: {
    idle: {
      title: "ค้นหาในร้าน",
      hint: "พิมพ์ชื่อวัตถุดิบ สูตร เมนูขาย หรือแผนผลิต",
    },
    noResults: {
      title: "ไม่พบผลลัพธ์",
      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",
      actionLabel: "ล้างคำค้นหา",
    },
  },
  notifications: {
    clear: {
      title: "ไม่มีอะไรต้องรีบดู",
      hint: "ทุกอย่างดูเรียบร้อยดี",
      actionLabel: "กลับหน้าแรก",
      actionHref: "/",
    },
  },
  activity: {
    none: {
      title: "ยังไม่มีบันทึก",
      hint: "การโหลดข้อมูล แก้เมนู และปรับสต๊อกจะแสดงที่นี่",
      actionLabel: "กลับหน้าแรก",
      actionHref: "/",
    },
  },
  import: {
    noData: {
      title: "ไม่พบข้อมูลในไฟล์",
      hint: "ตรวจสอบชีตและคอลัมน์ให้ตรงกับที่ระบบรองรับ",
      actionLabel: "เลือกไฟล์ใหม่",
    },
  },
  recipe: {
    ingredients: {
      title: "ยังไม่มีวัตถุดิบในสูตร",
      hint: "เพิ่มวัตถุดิบเพื่อคำนวณต้นทุนและราคาขายแนะนำ",
      actionLabel: "สร้างสูตรของคุณ",
      actionHref: "/recipes/builder",
    },
    builderLines: {
      title: "ยังไม่มีวัตถุดิบในสูตร",
      hint: "เพิ่มสัก 2-3 รายการก่อน ระบบจะคำนวณต้นทุนให้ทันที",
    },
  },
  home: {
    noPlan: {
      title: "ยังไม่ได้วางแผนผลิตวันนี้",
      hint: "วางแผนก่อน จึงจะเห็นต้นทุนและกำไรคาดการณ์",
      actionLabel: "วางแผนผลิต",
      actionHref: "/production",
    },
  },
  loading: {
    title: "กำลังโหลด...",
    hint: "รอสักครู่",
  },
} as const;
