/**
 * Rule catalog for Opening recommendations (rule-based, no AI).
 * Tang Tao / ขนมโตเกียว opening kit — keyword rules vs live bi_assets.
 */

export type RecKind =
  | "missing"
  | "related"
  | "supplier"
  | "knowledge"
  | "warning";

export type CatalogMissingRule = {
  id: string;
  /** If any asset name/category matches these, item is considered present */
  presentKeywords: string[];
  suggestName: string;
  category: string;
  note: string;
  warning?: string;
  linkHref?: string;
  linkLabel?: string;
  score: number;
};

export type CatalogRelatedRule = {
  id: string;
  whenKeywords: string[];
  unlessKeywords: string[];
  suggestName: string;
  category: string;
  note: string;
  warning?: string;
  linkHref?: string;
  linkLabel?: string;
  score: number;
};

export type CatalogSupplierRule = {
  id: string;
  /** Match asset category or name */
  forKeywords: string[];
  supplierName: string;
  note: string;
  warning?: string;
  linkHref?: string;
  linkLabel?: string;
  score: number;
};

export type CatalogKnowledgeRule = {
  id: string;
  /** Fire when keywords present OR when `whenMissing` and keywords absent */
  whenKeywords?: string[];
  whenMissingKeywords?: string[];
  title: string;
  note: string;
  warning?: string;
  linkHref?: string;
  linkLabel?: string;
  score: number;
  kind?: "knowledge" | "warning";
};

/** Must-have starter suggestions when not in Checklist */
export const MISSING_ITEM_RULES: CatalogMissingRule[] = [
  {
    id: "miss-stove",
    presentKeywords: ["เตาโตเกียว", "เตาขนม", "กระทะโตเกียว"],
    suggestName: "เตาโตเกียว",
    category: "อุปกรณ์ทำขนมโตเกียว",
    note: "หัวใจร้านขนมโตเกียว — ควรมีอย่างน้อย 1 เครื่องก่อนเปิด",
    warning: "ไม่มีเตา = ยังผลิตขายไม่ได้",
    linkHref: "/opening/checklist/equipment",
    linkLabel: "ไปหมวดอุปกรณ์",
    score: 100,
  },
  {
    id: "miss-pos",
    presentKeywords: ["pos", "พีโอเอส", "เครื่องคิดเงิน"],
    suggestName: "เครื่อง POS",
    category: "ระบบและ POS",
    note: "เก็บเงิน · ออกรายงาน · ผูกสต็อกเบื้องต้น",
    linkHref: "/opening/procurement?stage=request_quote",
    linkLabel: "ไปขอราคา",
    score: 95,
  },
  {
    id: "miss-display",
    presentKeywords: ["ตู้โชว์", "ตู้แช่", "ตู้เย็นโชว์"],
    suggestName: "ตู้โชว์",
    category: "ตู้และการจัดเก็บ",
    note: "โชว์สินค้าหน้าตู้ · เก็บของสด",
    linkHref: "/opening/checklist/equipment",
    linkLabel: "ไปหมวดอุปกรณ์",
    score: 90,
  },
  {
    id: "miss-sign",
    presentKeywords: ["ป้ายร้าน", "ป้ายไฟ", "ป้ายหน้าร้าน"],
    suggestName: "ป้ายร้าน",
    category: "หน้าร้านและป้าย",
    note: "ลูกค้าเห็นร้านจากถนน",
    linkHref: "/opening/checklist/equipment",
    linkLabel: "ไปหมวดอุปกรณ์",
    score: 80,
  },
  {
    id: "miss-packaging",
    presentKeywords: ["กล่อง", "ถุง", "บรรจุ", "packaging"],
    suggestName: "กล่อง / ถุงใส่ขนม",
    category: "บรรจุภัณฑ์",
    note: "ขายกลับบ้านต้องมี Packaging พร้อมวันเปิด",
    linkHref: "/opening/checklist/packaging",
    linkLabel: "ไปหมวดบรรจุภัณฑ์",
    score: 85,
  },
  {
    id: "miss-flour",
    presentKeywords: ["แป้ง", "หมูหย็อง", "ไส้"],
    suggestName: "วัตถุดิบเริ่มต้น (แป้ง / ไส้)",
    category: "ซอสและเครื่องปรุง",
    note: "วัตถุดิบหลักสำหรับเมนูเปิดร้าน",
    linkHref: "/opening/checklist/ingredients",
    linkLabel: "ไปหมวดวัตถุดิบ",
    score: 75,
  },
];

/** If you have X, you often need Y */
export const RELATED_ITEM_RULES: CatalogRelatedRule[] = [
  {
    id: "rel-pos-printer",
    whenKeywords: ["pos", "พีโอเอส"],
    unlessKeywords: ["ปริ้น", "printer", "เครื่องพิมพ์ใบเสร็จ"],
    suggestName: "เครื่องพิมพ์ใบเสร็จ",
    category: "ระบบและ POS",
    note: "มี POS แล้ว มักต้องมีเครื่องพิมพ์คู่กัน",
    linkHref: "/opening/assets/new",
    linkLabel: "เพิ่มรายการ",
    score: 70,
  },
  {
    id: "rel-stove-oil",
    whenKeywords: ["เตาโตเกียว", "เตาขนม"],
    unlessKeywords: ["น้ำมัน", "กระดาษซับ"],
    suggestName: "น้ำมันทอด / กระดาษซับ",
    category: "ซอสและเครื่องปรุง",
    note: "คู่กับเตา — ของใช้สิ้นเปลืองวันเปิด",
    linkHref: "/opening/checklist/ingredients",
    linkLabel: "ไปวัตถุดิบ",
    score: 65,
  },
  {
    id: "rel-display-light",
    whenKeywords: ["ตู้โชว์"],
    unlessKeywords: ["ไฟตู้", "หลอดไฟ"],
    suggestName: "ตรวจไฟตู้โชว์ / ปลั๊ก",
    category: "เครื่องใช้ไฟฟ้า",
    note: "ตู้โชว์ต้องมีจุดไฟและพื้นที่ติดตั้ง",
    warning: "วัดพื้นที่ร้านก่อนสั่งตู้",
    linkHref: "/opening/procurement",
    linkLabel: "ไปจัดหา",
    score: 55,
  },
  {
    id: "rel-pack-sticker",
    whenKeywords: ["กล่อง", "ถุง", "บรรจุ"],
    unlessKeywords: ["สติ๊กเกอร์", "สติกเกอร์", "โลโก้"],
    suggestName: "สติ๊กเกอร์โลโก้",
    category: "บรรจุภัณฑ์",
    note: "แพ็กของพร้อมแบรนด์ร้าน",
    linkHref: "/opening/checklist/packaging",
    linkLabel: "ไปบรรจุภัณฑ์",
    score: 50,
  },
];

/** Supplier tips by category / keyword */
export const SUPPLIER_RULES: CatalogSupplierRule[] = [
  {
    id: "sup-pos",
    forKeywords: ["pos", "พีโอเอส", "ระบบและ pos"],
    supplierName: "SmartPOS โคราช",
    note: "ใบเสนอราคา POS · ติดตั้งในเมือง",
    linkHref: "/opening/procurement?stage=compare",
    linkLabel: "ไปเปรียบเทียบราคา",
    score: 60,
  },
  {
    id: "sup-fridge",
    forKeywords: ["ตู้โชว์", "ตู้แช่", "ตู้และการจัดเก็บ"],
    supplierName: "ร้านตู้เย็นทอง",
    note: "ใบเสนอราคาตู้โชว์",
    linkHref: "/opening/procurement?stage=request_quote",
    linkLabel: "ไปขอราคา",
    score: 58,
  },
  {
    id: "sup-ingredient",
    forKeywords: ["ซอส", "เนื้อ", "วัตถุดิบ", "หมูหย็อง", "แป้ง"],
    supplierName: "Makro",
    note: "หมูหย็อง · แป้ง · Packaging เปิดร้าน",
    linkHref: "/opening/checklist/ingredients",
    linkLabel: "ไปวัตถุดิบ",
    score: 55,
  },
  {
    id: "sup-fresh",
    forKeywords: ["ไข่", "ผัก", "ของสด"],
    supplierName: "ตลาดสดตั้งเตา",
    note: "ของสดรายวัน",
    linkHref: "/opening/checklist/ingredients",
    linkLabel: "ไปวัตถุดิบ",
    score: 52,
  },
  {
    id: "sup-small",
    forKeywords: ["ของใช้", "อุปกรณ์เล็ก", "ช้อน", "ถ้วย"],
    supplierName: "Shopee",
    note: "สั่งของเล็ก · เปรียบเทียบราคา",
    warning: "เช็คเวลานำส่งก่อน Soft Opening",
    linkHref: "/opening/procurement",
    linkLabel: "ไปจัดหา",
    score: 48,
  },
];

/** Knowledge + warnings */
export const KNOWLEDGE_RULES: CatalogKnowledgeRule[] = [
  {
    id: "know-no-price",
    whenKeywords: ["*no_price*"], // special handled in engine
    title: "มีรายการยังไม่ใส่ราคา",
    note: "งบและจัดหาจะครบเมื่อใส่ราคาประเมินหรือราคาจริง",
    warning: "สรุปงบอาจต่ำกว่าความเป็นจริง",
    linkHref: "/opening/budget",
    linkLabel: "ไปงบประมาณ",
    score: 88,
    kind: "warning",
  },
  {
    id: "know-order-no-supplier",
    whenKeywords: ["*ordered_no_supplier*"],
    title: "สั่งแล้วแต่ยังไม่มี Supplier",
    note: "ใส่ชื่อร้านซื้อ เพื่อติดตามของและบิล",
    warning: "ของค้างรับอาจตามยาก",
    linkHref: "/opening/procurement?stage=outstanding",
    linkLabel: "ดูของค้างรับ",
    score: 82,
    kind: "warning",
  },
  {
    id: "know-soft-open",
    whenMissingKeywords: ["soft opening", "ซ้อมเปิด"],
    title: "วางแผน Soft Opening",
    note: "ซ้อมเปิดช่วยจับของขาดและจังหวะครัวก่อน Grand Opening",
    linkHref: "/opening/calendar",
    linkLabel: "ไปไทม์ไลน์",
    score: 40,
    kind: "knowledge",
  },
  {
    id: "know-docs",
    whenMissingKeywords: ["ใบอนุญาต", "เอกสาร"],
    title: "ตรวจเอกสารก่อนเปิด",
    note: "ใบอนุญาต / เอกสารสำคัญควรครบก่อนวันเปิด",
    warning: "เปิดโดยเอกสารไม่ครบมีความเสี่ยง",
    linkHref: "/opening/documents",
    linkLabel: "ไปเอกสาร",
    score: 45,
    kind: "knowledge",
  },
];
