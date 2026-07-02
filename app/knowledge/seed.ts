import type { KnowledgeSeed } from "./types";

/**
 * Example knowledge cards for demo entities.
 * Loaded by KnowledgeRepository — not embedded in master repositories.
 */
export const knowledgeSeeds: KnowledgeSeed[] = [
  {
    entityType: "ingredient",
    entityId: "pork-mince",
    storage: "แช่เย็น 0–4°C ชั้นวางล่าง",
    shelfLife: "ใช้ภายใน 2 วันหลังซื้อ",
    supplier: "ตลาดสดเช้า / ซัพพลายเนื้อประจำ",
    preparation: "คลุกเครื่องปรุงก่อนผัด ไม่ต้องล้างน้ำ",
    warnings: "ห้ามทิ้งไว้นอกตู้เย็นเกิน 30 นาที",
    tips: "ซื้อเช้า แบ่งแพ็ก 200–300 ก. ต่อถุง",
  },
  {
    entityType: "ingredient",
    entityId: "holy-basil",
    storage: "แช่ตู้เย็น ห่อกระดาษชื้น",
    shelfLife: "ใช้ภายใน 1–2 วัน",
    supplier: "ตลาดผักเช้า",
    preparation: "คัดใบ ล้างเบาๆ ปล่อยให้แห้งก่อนผัด",
    warnings: "ใบช้ำทำให้ขม — ทิ้งใบดำ",
    tips: "ซื้อเยอะช่วงเช้า แช่ได้ถ้าห่อดี",
  },
  {
    entityType: "ingredient",
    entityId: "chili-garlic",
    storage: "แช่เย็นในภาชนะปิดสนิท",
    shelfLife: "ใช้ภายใน 5–7 วัน",
    supplier: "ทำเองในครัว / ซื้อสำเร็จรูป",
    preparation: "ตักตามสูตร ไม่ต้องผัดก่อน",
    warnings: "ระวังน้ำมันกระเด็นเวลาผัด",
    tips: "ทำล็อตใหญ่ แบ่งถุงแช่แข็งได้",
  },
  {
    entityType: "recipe",
    entityId: "recipe-krapao-moo",
    storage: "เสิร์ฟร้อนทันที",
    shelfLife: "ทานภายใน 30 นาที",
    supplier: "",
    preparation: "ผัดไฟแรง ใส่ใบกะเพราท้ายสุด",
    warnings: "อย่าผัดนาน ใบกะเพราจะดำ",
    tips: "เตรียมพริกกระเทียมล่วงหน้า 2 มื้อ",
  },
  {
    entityType: "recipe",
    entityId: "recipe-pork-burger",
    storage: "เสิร์ฟร้อน หรือห่อกล่องภายใน 5 นาที",
    shelfLife: "ทานภายใน 1 ชม. หลังประกอบ",
    preparation: "ย่างเนื้อให้สุดก่อนประกอบ",
    warnings: "เนื้อดิบห้ามสัมผัสขนมปังโดยตรง",
    tips: "ปิ้งขนมปังก่อนลูกค้ารอ — ลดเวลารอ",
  },
  {
    entityType: "packaging",
    entityId: "pack-box-750ml",
    storage: "เก็บแห้ง หลีกเลี่ยงแดด",
    shelfLife: "ใช้ได้ 6–12 เดือน (ตรวจกล่องบุบ)",
    supplier: "ร้านบรรจุภัณฑ์ออนไลน์ / ส่งรายสัปดาห์",
    preparation: "ประกอบฝาให้สนิทก่อนใส่อาหาร",
    warnings: "กล่องบุบอาจรั่ว — อย่าใช้",
    tips: "สั่งทีละ 500 ใบ ลดต้นทุนต่อชิ้น",
  },
  {
    entityType: "packaging",
    entityId: "pack-plastic-spoon",
    storage: "เก็บแห้งในถุงปิด",
    shelfLife: "ใช้ได้ยาว ตรวจฝีมือแตก",
    supplier: "ซื้อคู่กับกล่องจากร้านเดิม",
    preparation: "ใส่คู่กับกล่อง Grab",
    warnings: "",
    tips: "นับสต๊อกทุกสัปดาห์ — หมดบ่อยช่วงเดลิเวอรี่",
  },
];
