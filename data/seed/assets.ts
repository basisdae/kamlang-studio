/**
 * Tang Tao — Assets catalog (equipment / ทรัพย์สิน)
 * Shared by /opening/assets and budget linking.
 * Ready for future Supabase mapping (same field names).
 */

import type { ProcurementMeta } from "../../lib/types/procurement";

export type AssetPriority = "must" | "should" | "nice";

/** Full lifecycle status for Asset Profile */
export type AssetStatus =
  | "planned"
  | "awaiting_quote"
  | "ready_to_buy"
  | "ordered"
  | "awaiting_delivery"
  | "received"
  | "in_use"
  | "repairing"
  | "broken"
  | "retired";

export type AssetPurchaseChannel =
  | "store"
  | "online"
  | "marketplace"
  | "other"
  | "";

export type AssetPurchaseRecord = {
  id: string;
  assetId: string;
  purchasedAt: string;
  quantity: number;
  unitPrice: number;
  total: number;
  supplier: string;
  recordedBy: string;
  status: AssetStatus;
  note: string;
};

export type AssetRepairRecord = {
  id: string;
  assetId: string;
  reportedAt: string;
  symptom: string;
  repairer: string;
  cost: number | null;
  returnedAt: string | null;
  result: string;
  note: string;
};

export type AssetDecisionGroup = {
  id: string;
  name: string;
  assetIds: string[];
  /** null = undecided — only one may count in budget */
  selectedId: string | null;
};

export type AssetItem = {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  quantity: number;
  unit: string;
  estimatedPrice: number | null;
  actualPrice: number | null;
  supplier: string;
  purchaseChannel: AssetPurchaseChannel;
  purchaseUrl: string;
  priority: AssetPriority;
  status: AssetStatus;
  requiredForOpening: boolean;
  purchasedAt: string | null;
  size: string;
  color: string;
  material: string;
  power: string;
  specs: string;
  note: string;
  warranty: string;
  warrantyUntil: string | null;
  serialNumber: string;
  imageUrl: string | null;
  documentIds: string[];
  /** Optional decision group (e.g. POS pick-one) */
  decisionGroupId: string | null;
  /** From bi_assets.created_at when loaded online */
  createdAt?: string;
  /** Procurement meta in specifications.procurement */
  procurement?: ProcurementMeta;
  purchaseHistory: AssetPurchaseRecord[];
  repairHistory: AssetRepairRecord[];
};

export const ASSET_CATEGORIES = [
  "ซอสและเครื่องปรุง",
  "เนื้อสัตว์และของแปรรูป",
  "วัตถุดิบเพิ่มเติม",
  "อุปกรณ์ผสมแป้ง",
  "อุปกรณ์ทำขนมโตเกียว",
  "อุปกรณ์ทำอาหาร",
  "ตู้และการจัดเก็บ",
  "ระบบและ POS",
  "หน้าร้านและป้าย",
  "เครื่องใช้ไฟฟ้า",
  "ของใช้ในครัว",
  "การตลาด·หน้าร้าน",
  "การตลาด·ออนไลน์",
  "การตลาด·Branding",
  "การตลาด·สิ่งพิมพ์",
  "การตลาด·Promotion",
  "การตลาด·Content",
  "อื่นๆ",
] as const;

export const ASSET_UNITS = [
  "ชิ้น",
  "ชุด",
  "ใบ",
  "เครื่อง",
  "อัน",
  "คู่",
  "ขวด",
  "กระปุก",
  "แพ็ค",
  "กิโลกรัม",
  "ฝัก",
  "ถัง",
  "กล่อง",
] as const;

export const ASSET_PRIORITY_LABELS: Record<AssetPriority, string> = {
  must: "Must",
  should: "Should",
  nice: "Nice",
};

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  planned: "ยังไม่เริ่ม",
  awaiting_quote: "ต้องจัดหา",
  ready_to_buy: "ต้องจัดหา",
  ordered: "สั่งแล้ว",
  awaiting_delivery: "สั่งแล้ว",
  received: "ได้รับแล้ว",
  in_use: "มีแล้ว",
  repairing: "ส่งซ่อม",
  broken: "เสีย",
  retired: "ยกเลิก",
};

export const ASSET_STATUS_FLOW: AssetStatus[] = [
  "planned",
  "awaiting_quote",
  "ready_to_buy",
  "ordered",
  "awaiting_delivery",
  "received",
  "in_use",
  "repairing",
  "broken",
  "retired",
];

export const ASSET_CHANNEL_LABELS: Record<AssetPurchaseChannel, string> = {
  store: "ร้านค้า",
  online: "ออนไลน์",
  marketplace: "Marketplace",
  other: "อื่นๆ",
  "": "—",
};

/** มีแล้ว = in_use only (red-check items) */
export function isAssetOwned(status: AssetStatus) {
  return status === "in_use";
}

/** Counts toward “ยังต้องจัดหา” budget */
export function isAssetPlannedSpend(status: AssetStatus) {
  return (
    status === "planned" ||
    status === "awaiting_quote" ||
    status === "ready_to_buy"
  );
}

/** สั่งแล้ว */
export function isAssetOrdered(status: AssetStatus) {
  return status === "ordered" || status === "awaiting_delivery";
}

/** Counts toward actual spend (ซื้อจริง) — only after purchase recorded */
export function isAssetActualSpend(status: AssetStatus) {
  return status === "ordered" || status === "awaiting_delivery";
}

export function assetHasNoPrice(item: {
  estimatedPrice?: number | null;
  actualPrice?: number | null;
}) {
  return item.estimatedPrice == null && item.actualPrice == null;
}

function base(partial: Partial<AssetItem> & Pick<AssetItem, "id" | "name" | "category" | "quantity" | "unit" | "priority" | "status">): AssetItem {
  return {
    brand: "",
    model: "",
    estimatedPrice: null,
    actualPrice: null,
    supplier: "",
    purchaseChannel: "",
    purchaseUrl: "",
    requiredForOpening: true,
    purchasedAt: null,
    size: "",
    color: "",
    material: "",
    power: "",
    specs: "",
    note: "",
    warranty: "",
    warrantyUntil: null,
    serialNumber: "",
    imageUrl: null,
    documentIds: [],
    decisionGroupId: null,
    purchaseHistory: [],
    repairHistory: [],
    ...partial,
  };
}

export const SEED_ASSETS: AssetItem[] = [
  base({
    id: "as1",
    name: "เตาโตเกียว",
    category: "อุปกรณ์ทำอาหาร",
    brand: "Tokyo",
    model: "TK-2H",
    quantity: 1,
    unit: "เครื่อง",
    estimatedPrice: 4_500,
    actualPrice: 4_200,
    supplier: "ร้านแก๊สบ้านโป่ง",
    purchaseChannel: "store",
    purchaseUrl: "https://example.com/stove",
    priority: "must",
    status: "in_use",
    requiredForOpening: true,
    purchasedAt: "2026-07-10",
    size: "2 หัว",
    specs: "ใช้ถังแก๊ส · ติดตั้งมุมครัว",
    note: "ติดตั้งแล้ว · ใช้กับถังแก๊ส 15 กก.",
    warranty: "1 ปี",
    warrantyUntil: "2027-07-10",
    serialNumber: "TG-2H-88421",
    documentIds: ["d1", "d2", "d3", "d4"],
    purchaseHistory: [
      {
        id: "ph1",
        assetId: "as1",
        purchasedAt: "2026-07-10",
        quantity: 1,
        unitPrice: 4_200,
        total: 4_200,
        supplier: "ร้านแก๊สบ้านโป่ง",
        recordedBy: "เหมียว",
        status: "in_use",
        note: "รอบเปิดร้าน",
      },
    ],
  }),
  base({
    id: "as-gas",
    name: "ถังแก๊ส 15 กก.",
    category: "อุปกรณ์ทำอาหาร",
    brand: "PTT",
    model: "15kg",
    quantity: 2,
    unit: "ใบ",
    estimatedPrice: 1_800,
    actualPrice: 1_650,
    supplier: "ร้านแก๊สบ้านโป่ง",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "must",
    status: "received",
    requiredForOpening: true,
    purchasedAt: "2026-07-10",
    size: "15 กก.",
    specs: "วาล์วนิรภัย",
    note: "ซื้อคู่กับเตาโตเกียว",
    warranty: "",
    serialNumber: "",
    purchaseHistory: [
      {
        id: "ph-gas",
        assetId: "as-gas",
        purchasedAt: "2026-07-10",
        quantity: 2,
        unitPrice: 1_650,
        total: 3_300,
        supplier: "ร้านแก๊สบ้านโป่ง",
        recordedBy: "เหมียว",
        status: "received",
        note: "",
      },
    ],
  }),
  base({
    id: "as-pos-mini",
    name: "SUNMI D3 Mini",
    category: "ระบบและ POS",
    brand: "SUNMI",
    model: "D3 Mini",
    quantity: 1,
    unit: "เครื่อง",
    estimatedPrice: 12_500,
    actualPrice: null,
    supplier: "SmartPOS โคราช",
    purchaseChannel: "online",
    purchaseUrl: "https://example.com/sunmi-mini",
    priority: "must",
    status: "ready_to_buy",
    requiredForOpening: true,
    purchasedAt: null,
    specs: "จอเล็ก · พิมพ์ในตัว · เหมาะเคาน์เตอร์แคบ",
    note: "ตัวเลือก A ใน decision group POS",
    warranty: "1 ปี",
    serialNumber: "",
    decisionGroupId: "pos",
  }),
  base({
    id: "as-pos-156",
    name: "SUNMI D3 15.6 นิ้ว",
    category: "ระบบและ POS",
    brand: "SUNMI",
    model: "D3 15.6",
    quantity: 1,
    unit: "เครื่อง",
    estimatedPrice: 16_800,
    actualPrice: null,
    supplier: "SmartPOS โคราช",
    purchaseChannel: "online",
    purchaseUrl: "https://example.com/sunmi-156",
    priority: "must",
    status: "ready_to_buy",
    requiredForOpening: true,
    purchasedAt: null,
    size: "15.6 นิ้ว",
    specs: "จอลูกค้าคู่ · สแกนเนอร์",
    note: "ตัวเลือก B ใน decision group POS",
    warranty: "1 ปี",
    serialNumber: "",
    decisionGroupId: "pos",
  }),
  base({
    id: "as2",
    name: "ตู้โชว์กระจก",
    category: "ตู้และการจัดเก็บ",
    brand: "ColdGold",
    model: "CG-120",
    quantity: 1,
    unit: "เครื่อง",
    estimatedPrice: 12_000,
    actualPrice: null,
    supplier: "ร้านตู้เย็นทอง",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "must",
    status: "awaiting_quote",
    requiredForOpening: true,
    purchasedAt: null,
    size: "120 ซม.",
    material: "กระจกใส",
    specs: "ตู้โชว์หน้าร้าน",
    note: "รอใบเสนอราคา",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-basket",
    name: "ตะกร้อมือ",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 3,
    unit: "ชิ้น",
    estimatedPrice: 120,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    specs: "สแตนเลส",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-mixer",
    name: "เครื่องตีไฟฟ้า",
    category: "เครื่องใช้ไฟฟ้า",
    brand: "Kitche",
    model: "HM-200",
    quantity: 1,
    unit: "เครื่อง",
    estimatedPrice: 1_890,
    actualPrice: null,
    supplier: "Shopee",
    purchaseChannel: "marketplace",
    purchaseUrl: "https://shopee.co.th/example-mixer",
    priority: "must",
    status: "ready_to_buy",
    requiredForOpening: true,
    purchasedAt: null,
    power: "200W",
    specs: "ตีแป้ง / ครีม",
    note: "",
    warranty: "6 เดือน",
    serialNumber: "",
  }),
  base({
    id: "as-strainer",
    name: "กระชอน",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 2,
    unit: "ชิ้น",
    estimatedPrice: 89,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: false,
    purchasedAt: null,
    material: "สแตนเลส",
    specs: "",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-scale",
    name: "เครื่องชั่งดิจิตอล",
    category: "เครื่องใช้ไฟฟ้า",
    brand: "Camry",
    model: "EK3550",
    quantity: 1,
    unit: "เครื่อง",
    estimatedPrice: 450,
    actualPrice: 420,
    supplier: "Shopee",
    purchaseChannel: "marketplace",
    purchaseUrl: "https://shopee.co.th/example-scale",
    priority: "must",
    status: "in_use",
    requiredForOpening: true,
    purchasedAt: "2026-07-05",
    specs: "ชั่ง 0.1–5 กก.",
    note: "",
    warranty: "1 ปี",
    warrantyUntil: "2027-07-05",
    serialNumber: "SC-9912",
    purchaseHistory: [
      {
        id: "ph-scale",
        assetId: "as-scale",
        purchasedAt: "2026-07-05",
        quantity: 1,
        unitPrice: 420,
        total: 420,
        supplier: "Shopee",
        recordedBy: "ครีม",
        status: "in_use",
        note: "",
      },
    ],
    repairHistory: [
      {
        id: "rp-scale",
        assetId: "as-scale",
        reportedAt: "2026-07-08",
        symptom: "จอไม่ติดเป็นพัก ๆ",
        repairer: "ร้านมือถือใกล้บ้าน",
        cost: 150,
        returnedAt: "2026-07-08",
        result: "เปลี่ยนสายไฟ · ใช้งานได้",
        note: "",
      },
    ],
  }),
  base({
    id: "as-spatula",
    name: "พายยาง",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 4,
    unit: "ชิ้น",
    estimatedPrice: 45,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    material: "ซิลิโคน",
    specs: "",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-bowl",
    name: "ชามผสม",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 3,
    unit: "ใบ",
    estimatedPrice: 79,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    material: "สแตนเลส",
    size: "ใหญ่ / กลาง / เล็ก",
    specs: "",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-jug",
    name: "เหยือกตวง",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 2,
    unit: "ใบ",
    estimatedPrice: 65,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    material: "พลาสติกใส",
    specs: "500 ml / 1 L",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-spoon",
    name: "ช้อนตวง",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 1,
    unit: "ชุด",
    estimatedPrice: 59,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    specs: "ชุดตวงมาตรฐาน",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-flour",
    name: "กระปุกเก็บแป้ง",
    category: "ตู้และการจัดเก็บ",
    brand: "",
    model: "",
    quantity: 4,
    unit: "ใบ",
    estimatedPrice: 99,
    actualPrice: null,
    supplier: "Shopee",
    purchaseChannel: "marketplace",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    material: "พลาสติก",
    specs: "ฝาปิดสนิท",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-rack",
    name: "ตะแกรงพัก",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 2,
    unit: "ชิ้น",
    estimatedPrice: 180,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "should",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    material: "สแตนเลส",
    specs: "พักขนม / ทอด",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-scraper",
    name: "เกรียง",
    category: "ของใช้ในครัว",
    brand: "",
    model: "",
    quantity: 2,
    unit: "ชิ้น",
    estimatedPrice: 35,
    actualPrice: null,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "nice",
    status: "planned",
    requiredForOpening: false,
    purchasedAt: null,
    specs: "เกรียงแป้ง",
    note: "",
    warranty: "",
    serialNumber: "",
  }),
  base({
    id: "as-box",
    name: "กล่องพลาสติกเก็บไส้",
    category: "ตู้และการจัดเก็บ",
    brand: "",
    model: "",
    quantity: 10,
    unit: "ใบ",
    estimatedPrice: 25,
    actualPrice: 22,
    supplier: "Makro",
    purchaseChannel: "store",
    purchaseUrl: "",
    priority: "must",
    status: "awaiting_delivery",
    requiredForOpening: true,
    purchasedAt: "2026-07-09",
    material: "พลาสติกใส",
    specs: "เก็บไส้ / หมูหย็อง",
    note: "สั่งแล้ว รอรับ",
    warranty: "",
    serialNumber: "",
    purchaseHistory: [
      {
        id: "ph-box",
        assetId: "as-box",
        purchasedAt: "2026-07-09",
        quantity: 10,
        unitPrice: 22,
        total: 220,
        supplier: "Makro",
        recordedBy: "ครีม",
        status: "awaiting_delivery",
        note: "รอบเปิดร้าน",
      },
    ],
  }),
  base({
    id: "as-sign",
    name: "ป้ายร้าน ตั้งเตา",
    category: "หน้าร้านและป้าย",
    brand: "",
    model: "",
    quantity: 1,
    unit: "ชุด",
    estimatedPrice: null,
    actualPrice: null,
    supplier: "",
    purchaseChannel: "",
    purchaseUrl: "",
    priority: "must",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    specs: "ป้ายหน้าร้าน Soft Opening",
    note: "ยังไม่หาราคา",
    warranty: "",
    serialNumber: "",
  }),
];

/** POS: pick exactly one — do not sum both into budget */
export const SEED_ASSET_DECISION_GROUPS: AssetDecisionGroup[] = [
  {
    id: "pos",
    name: "POS",
    assetIds: ["as-pos-mini", "as-pos-156"],
    selectedId: null,
  },
];

export const SEED_ASSET_TIMELINES: Record<
  string,
  { id: string; label: string; at: string; done: boolean; person?: string }[]
> = {
  as1: [
    { id: "t1", label: "เพิ่มรายการ", at: "2026-07-08", done: true, person: "เดย์" },
    { id: "t2", label: "อัปเดตราคา", at: "2026-07-09", done: true, person: "ครีม" },
    { id: "t3", label: "ซื้อ", at: "2026-07-10", done: true, person: "เหมียว" },
    { id: "t4", label: "ได้รับของ", at: "2026-07-10", done: true, person: "เหมียว" },
    { id: "t5", label: "เริ่มใช้งาน", at: "2026-07-10", done: true, person: "เหมียว" },
  ],
};

export type AssetTimelineStep = {
  id: string;
  label: string;
  at: string;
  done: boolean;
  person?: string;
};
