/**

 * Empty state copy — explain why, what next, action label.

 */

export const EMPTY_STATE = {

  recipes: {

    none: {

      title: "ยังไม่มีสูตรในรายการ",

      hint: "เริ่มสร้างสูตรเพื่อดูต้นทุนและราคาแนะนำ",

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

      hint: "ใส่ราคาขายคู่กับสูตร เพื่อวางแผนวันนี้ได้",

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

      hint: "เมนูนี้อาจถูกลบหรือหาไม่เจอในร้านคุณ",

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

      title: "ยังไม่ได้เลือกของห่อกลับบ้าน",

      hint: "แก้ไขเมนูขายเพื่อเลือกถุง กล่อง หรือช้อน",

    },

  },

  ingredients: {

    none: {

      title: "ยังไม่มีวัตถุดิบในร้าน",

      hint: "นำเข้าจาก Excel เพื่อเพิ่มรายการวัตถุดิบ",

      actionLabel: "นำเข้าจาก Excel",

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

      title: "ยังไม่ได้บันทึกของที่เหลือ",

      hint: "นำเข้าจาก Excel หรือเอาเข้าครัวหลังซื้อของ",

      actionLabel: "นำเข้าจาก Excel",

      actionHref: "/import",

    },

    search: {

      title: "ไม่พบวัตถุดิบที่ค้นหา",

      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",

      actionLabel: "ล้างคำค้นหา",

    },

    filter: {

      title: "ไม่มีรายการในหมวดนี้",

      hint: "ลองเปลี่ยนตัวเลือกดูหรือดูทั้งหมด",

      actionLabel: "ดูทั้งหมด",

    },

  },

  purchase: {

    noPlan: {

      title: "ยังไม่มีรายการซื้อของวันนี้",

      hint: "วางแผนวันนี้ก่อน แล้วจะบอกว่าต้องซื้ออะไร",

      actionLabel: "ไปวางแผนวันนี้",

      actionHref: "/production/edit",

    },

  },

  production: {

    noPlan: {

      title: "ยังไม่มีแผนวันนี้",

      hint: "ใส่เมนูและจำนวน แล้วจะสรุปของที่ต้องซื้อให้",

      actionLabel: "วางแผนวันนี้",

    },

    packaging: {

      title: "ไม่มีของห่อกลับบ้านในแผนนี้",

      hint: "เมนูในแผนวันนี้ไม่ได้ใช้ถุงหรือกล่อง",

    },

  },

  today: {

    noPlan: {

      title: "ยังไม่มีงานครัววันนี้",

      hint: "บอกเจ้าของให้วางแผนวันนี้ก่อน",

      actionLabel: "ดูแผนวันนี้",

      actionHref: "/production",

    },

    packaging: {

      title: "ไม่มีของห่อกลับบ้านวันนี้",

      hint: "เมนูวันนี้ไม่ได้ใช้ถุงหรือกล่อง",

    },

  },

  search: {

    idle: {

      title: "พิมพ์เพื่อค้นหา",

      hint: "วัตถุดิบ สูตร เมนูขาย แผนวันนี้",

    },

    noResults: {

      title: "หาไม่เจอ",

      hint: "ลองคำอื่นหรือตรวจสอบการสะกด",

      actionLabel: "ล้างคำค้นหา",

    },

  },

  notifications: {

    clear: {

      title: "ไม่มีอะไรต้องรีบดู",

      hint: "ทุกอย่างเรียบร้อย — กลับไปทำงานต่อได้",

      actionLabel: "กลับหน้าแรก",

      actionHref: "/",

    },

  },

  activity: {

    none: {

      title: "ยังไม่มีบันทึก",

      hint: "เวลาโหลดข้อมูล แก้เมนู หรือนับของ จะเห็นที่นี่",

      actionLabel: "กลับหน้าแรก",

      actionHref: "/",

    },

  },

  import: {

    noData: {

      title: "ไม่พบข้อมูลในไฟล์",

      hint: "ตรวจสอบตารางและคอลัมน์ในไฟล์ให้ตรงกับที่แอปรองรับ",

      actionLabel: "เลือกไฟล์ใหม่",

    },

  },

  recipe: {

    ingredients: {

      title: "ยังไม่มีวัตถุดิบในสูตร",

      hint: "เพิ่มวัตถุดิบเพื่อดูต้นทุนและราคาแนะนำ",

      actionLabel: "สร้างสูตรของคุณ",

      actionHref: "/recipes/builder",

    },

    builderLines: {

      title: "ยังไม่มีวัตถุดิบในสูตร",

      hint: "ใส่ 2–3 อย่าง แล้วจะเห็นต้นทุนทันที",

    },

  },

  home: {

    noPlan: {

      title: "ยังไม่ได้วางแผนวันนี้",

      hint: "วางแผนก่อน จึงจะเห็นต้นทุนและกำไรโดยประมาณ",

      actionLabel: "วางแผนวันนี้",

      actionHref: "/production",

    },

  },

  loading: {

    title: "กำลังโหลด...",

    hint: "รอสักครู่",

  },

} as const;

