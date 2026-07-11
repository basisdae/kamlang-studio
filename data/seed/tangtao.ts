/**
 * Single Seed Data — Workspace ตั้งเตา
 *
 * All BI screens must import from this file (or thin re-exports).
 * Do not duplicate Tang Tao lists in feature sampleData files.
 */

/* -------------------------------------------------------------------------- */
/* Business                                                                   */
/* -------------------------------------------------------------------------- */

export const WORKSPACE_NAME = "ตั้งเตา";
export const APP_TAGLINE = "Every number tells a story.";
export const SEED_BUDGET_TARGET = 120_000;

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

export type BudgetPriority = "must" | "should" | "nice";

export type BudgetStatus =
  | "no_price"
  | "comparing"
  | "ready_to_buy"
  | "purchased"
  | "awaiting_delivery"
  | "received"
  | "installed";

export type OpeningCategory = {
  id: string;
  name: string;
  itemCount: number;
  estimatedTotal: number;
  unknownPriceCount: number;
  progress: number;
};

export type TeamMember = {
  id: string;
  name: string;
  amount: number;
  percent: number;
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type BudgetItem = {
  id: string;
  name: string;
  category: string;
  priority: BudgetPriority;
  status: BudgetStatus;
  estimatedPrice: number | null;
  actualPrice: number | null;
  quantity: number;
  /** Link to /opening/assets/[id] when set */
  assetId?: string | null;
  /** Mutual-exclusion group (e.g. POS pick-one) */
  decisionGroupId?: string | null;
};

import {
  ASSET_CATEGORIES,
  ASSET_UNITS,
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_FLOW,
  ASSET_CHANNEL_LABELS,
  SEED_ASSETS,
  SEED_ASSET_DECISION_GROUPS,
  SEED_ASSET_TIMELINES,
  isAssetOwned,
  isAssetPlannedSpend,
  isAssetActualSpend,
} from "./assets";

export type {
  AssetStatus,
  AssetPriority,
  AssetItem,
  AssetTimelineStep,
  AssetPurchaseRecord,
  AssetRepairRecord,
  AssetDecisionGroup,
  AssetPurchaseChannel,
} from "./assets";

export {
  ASSET_CATEGORIES,
  ASSET_UNITS,
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_LABELS,
  ASSET_STATUS_FLOW,
  ASSET_CHANNEL_LABELS,
  SEED_ASSETS,
  SEED_ASSET_DECISION_GROUPS,
  SEED_ASSET_TIMELINES,
  isAssetOwned,
  isAssetPlannedSpend,
  isAssetActualSpend,
};

export type InitialStockItem = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  estimatedCost: number | null;
};

export type PartnerStatus = "active" | "pending" | "paused";

export type Partner = {
  id: string;
  name: string;
  investment: number;
  percent: number;
  role: string;
  responsibility: string;
  status: PartnerStatus;
  payback: null;
  dividend: null;
  drawdown: null;
};

export type TimelineEventKind =
  | "budget_added"
  | "asset_added"
  | "purchased"
  | "quote"
  | "checklist"
  | "partner_added";

export type TimelineEvent = {
  id: string;
  at: string;
  person: string;
  category: string;
  item: string;
  action: string;
  kind: TimelineEventKind;
  href: string;
};

export type DocumentParentType = "asset" | "budget" | "initial_stock";

export type DocumentKind =
  | "image"
  | "pdf"
  | "quote"
  | "receipt"
  | "warranty"
  | "serial";

export type OpeningDocument = {
  id: string;
  parentType: DocumentParentType;
  parentId: string;
  parentName: string;
  kind: DocumentKind;
  title: string;
  detail?: string;
  person: string;
  at: string;
};

export type QuoteDocument = OpeningDocument & {
  kind: "quote";
  vendor: string;
  amount: number | null;
  validUntil: string;
};

export type CalendarPriority = "must" | "should" | "nice";

export type CalendarTaskStatus =
  | "done"
  | "in_progress"
  | "upcoming"
  | "overdue";

export type OpeningCalendarTask = {
  id: string;
  task: string;
  dayLabel: string;
  day: string;
  deadline: string;
  deadlineLabel: string;
  status: CalendarTaskStatus;
  priority: CalendarPriority;
  owner: string;
};

export type DecisionPriority = "must" | "should" | "nice";

export type DecisionItem = {
  id: string;
  title: string;
  /** Priority */
  priority: DecisionPriority;
  /** Deadline ISO + display label */
  deadline: string;
  deadlineLabel: string;
  /** ผลกระทบ */
  impact: string;
  /** งบประมาณที่เกี่ยวข้อง */
  budgetLabel: string;
  budgetAmount: number | null;
  /** Action ที่ควรทำ */
  action: string;
  href: string;
  owner: string;
};

/** UI tags for quote compare — no scoring yet */
export type QuotePickTag = "best_price" | "best_value" | "recommended";

export type QuoteOption = {
  id: string;
  vendor: string;
  amount: number;
  note?: string;
};

export type QuoteCompareGroup = {
  id: string;
  itemName: string;
  href: string;
  options: QuoteOption[];
};

export type ReadinessStatus = "ready" | "working" | "blocked";

export type ReadinessArea = {
  id: string;
  title: string;
  percent: number;
  status: ReadinessStatus;
  hint: string;
  href: string;
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  note: string;
};

/* -------------------------------------------------------------------------- */
/* Team / Partners — เดย์ ครีม เก็ต เหมียว                                      */
/* -------------------------------------------------------------------------- */

export const SEED_TEAM: TeamMember[] = [
  { id: "t1", name: "เดย์", amount: 40_000, percent: 33 },
  { id: "t2", name: "ครีม", amount: 36_000, percent: 30 },
  { id: "t3", name: "เก็ต", amount: 24_000, percent: 20 },
  { id: "t4", name: "เหมียว", amount: 20_000, percent: 17 },
];

export const SEED_PARTNERS: Partner[] = [
  {
    id: "p1",
    name: "เดย์",
    investment: 40_000,
    percent: 33,
    role: "ผู้ก่อตั้ง",
    responsibility: "ภาพรวมร้าน · ตัดสินใจเปิด · ประสานทีม",
    status: "active",
    payback: null,
    dividend: null,
    drawdown: null,
  },
  {
    id: "p2",
    name: "ครีม",
    investment: 36_000,
    percent: 30,
    role: "งบและจัดซื้อ",
    responsibility: "งบประมาณ · ใบเสนอราคา · วัตถุดิบเริ่มต้น",
    status: "active",
    payback: null,
    dividend: null,
    drawdown: null,
  },
  {
    id: "p3",
    name: "เก็ต",
    investment: 24_000,
    percent: 20,
    role: "ระบบและตรวจสอบ",
    responsibility: "POS · รายการตรวจสอบ · เอกสารเปิดร้าน",
    status: "active",
    payback: null,
    dividend: null,
    drawdown: null,
  },
  {
    id: "p4",
    name: "เหมียว",
    investment: 20_000,
    percent: 17,
    role: "ครัวและทรัพย์สิน",
    responsibility: "เตา · ถังแก๊ส · รับของ · ติดตั้ง",
    status: "active",
    payback: null,
    dividend: null,
    drawdown: null,
  },
];

/* -------------------------------------------------------------------------- */
/* Assets — see ./assets.ts (re-exported above)                                */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/* Initial Stock — จากข้อมูลจริงที่คุย                                        */
/* -------------------------------------------------------------------------- */

export const SEED_INITIAL_STOCK: InitialStockItem[] = [
  {
    id: "st1",
    name: "หมูหย็อง",
    unit: "กก.",
    quantity: 5,
    estimatedCost: 1_800,
  },
  {
    id: "st2",
    name: "Nutella",
    unit: "กระปุก",
    quantity: 6,
    estimatedCost: 1_200,
  },
  {
    id: "st3",
    name: "ซอสพิซซ่า",
    unit: "กระป๋อง",
    quantity: 8,
    estimatedCost: 960,
  },
  {
    id: "st4",
    name: "ไข่กุ้ง",
    unit: "กล่อง",
    quantity: 4,
    estimatedCost: 1_600,
  },
  {
    id: "st5",
    name: "ไข่ไก่",
    unit: "แผง",
    quantity: 10,
    estimatedCost: 1_400,
  },
  {
    id: "st6",
    name: "แป้ง",
    unit: "กก.",
    quantity: 20,
    estimatedCost: 800,
  },
  {
    id: "st7",
    name: "ขนมปัง",
    unit: "แพ็ก",
    quantity: 30,
    estimatedCost: 1_500,
  },
  {
    id: "st8",
    name: "Packaging",
    unit: "ชุด",
    quantity: 1,
    estimatedCost: 2_350,
  },
];

/* -------------------------------------------------------------------------- */
/* Budget — เป้า 120,000 · ผูกกับ Assets + Stock                               */
/* -------------------------------------------------------------------------- */

export const SEED_BUDGET_ITEMS: BudgetItem[] = [
  {
    id: "i1",
    name: "เตาโตเกียว",
    category: "อุปกรณ์ทำอาหาร",
    priority: "must",
    status: "installed",
    estimatedPrice: 4_500,
    actualPrice: 4_200,
    quantity: 1,
    assetId: "as1",
  },
  {
    id: "i2",
    name: "ถังแก๊ส 15 กก.",
    category: "อุปกรณ์ทำอาหาร",
    priority: "must",
    status: "purchased",
    estimatedPrice: 1_800,
    actualPrice: 1_650,
    quantity: 2,
    assetId: "as-gas",
  },
  {
    id: "i3",
    name: "ตู้โชว์กระจก",
    category: "ตู้และการจัดเก็บ",
    priority: "must",
    status: "comparing",
    estimatedPrice: 12_000,
    actualPrice: null,
    quantity: 1,
    assetId: "as2",
  },
  {
    id: "i4",
    name: "POS (เลือก 1 รุ่น)",
    category: "ระบบและ POS",
    priority: "must",
    status: "ready_to_buy",
    estimatedPrice: 12_500,
    actualPrice: null,
    quantity: 1,
    assetId: null,
    decisionGroupId: "pos",
  },
  {
    id: "i5",
    name: "ป้ายร้าน ตั้งเตา",
    category: "หน้าร้านและป้าย",
    priority: "must",
    status: "no_price",
    estimatedPrice: null,
    actualPrice: null,
    quantity: 1,
    assetId: "as-sign",
  },
  {
    id: "i6",
    name: "หมูหย็อง",
    category: "วัตถุดิบเริ่มต้น",
    priority: "must",
    status: "ready_to_buy",
    estimatedPrice: 1_800,
    actualPrice: null,
    quantity: 1,
  },
  {
    id: "i7",
    name: "Nutella",
    category: "วัตถุดิบเริ่มต้น",
    priority: "must",
    status: "comparing",
    estimatedPrice: 1_200,
    actualPrice: null,
    quantity: 1,
  },
  {
    id: "i8",
    name: "ซอสพิซซ่า · ไข่กุ้ง · ไข่ไก่ · แป้ง · ขนมปัง",
    category: "วัตถุดิบเริ่มต้น",
    priority: "must",
    status: "no_price",
    estimatedPrice: 6_260,
    actualPrice: null,
    quantity: 1,
  },
  {
    id: "i9",
    name: "Packaging",
    category: "แพ็กเกจ",
    priority: "must",
    status: "awaiting_delivery",
    estimatedPrice: 2_500,
    actualPrice: 2_350,
    quantity: 1,
  },
  {
    id: "i10",
    name: "โฆษณา LINE OA เปิดตัว",
    category: "การตลาดก่อนเปิด",
    priority: "should",
    status: "ready_to_buy",
    estimatedPrice: 2_000,
    actualPrice: null,
    quantity: 1,
  },
];

/* -------------------------------------------------------------------------- */
/* Checklist — รายการจริงเปิดร้าน                                              */
/* -------------------------------------------------------------------------- */

export const SEED_CHECKLIST: ChecklistItem[] = [
  { id: "c1", label: "สูตรหลัก", done: true },
  { id: "c2", label: "อุปกรณ์จำเป็น", done: false },
  { id: "c3", label: "POS", done: false },
  { id: "c4", label: "Packaging", done: true },
  { id: "c5", label: "ป้ายร้าน", done: false },
  { id: "c6", label: "ถังแก๊ส", done: true },
  { id: "c7", label: "วัตถุดิบเริ่มต้น", done: false },
  { id: "c8", label: "อบรมพนักงาน", done: false },
  { id: "c9", label: "Soft Opening", done: false },
  { id: "c10", label: "Grand Opening", done: false },
];

/* -------------------------------------------------------------------------- */
/* Categories — derived from seed budget                                      */
/* -------------------------------------------------------------------------- */

function buildCategories(items: BudgetItem[]): OpeningCategory[] {
  const map = new Map<string, OpeningCategory>();

  for (const item of items) {
    const id = item.category
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/[^\w\u0E00-\u0E7F-]/g, "");
    const existing = map.get(item.category);
    const line =
      (item.actualPrice ?? item.estimatedPrice ?? 0) * item.quantity;
    const unknown = item.estimatedPrice == null ? 1 : 0;

    if (existing) {
      existing.itemCount += 1;
      existing.estimatedTotal += line;
      existing.unknownPriceCount += unknown;
    } else {
      map.set(item.category, {
        id: id || item.category,
        name: item.category,
        itemCount: 1,
        estimatedTotal: line,
        unknownPriceCount: unknown,
        progress: 0,
      });
    }
  }

  return [...map.values()].map((cat) => ({
    ...cat,
    progress:
      cat.itemCount === 0
        ? 0
        : Math.round(
            ((cat.itemCount - cat.unknownPriceCount) / cat.itemCount) * 100
          ),
  }));
}

export const SEED_CATEGORIES: OpeningCategory[] =
  buildCategories(SEED_BUDGET_ITEMS);

/* -------------------------------------------------------------------------- */
/* Summary — computed from seed                                               */
/* -------------------------------------------------------------------------- */

const estimatedFromBudget = SEED_BUDGET_ITEMS.reduce((sum, item) => {
  const unit = item.actualPrice ?? item.estimatedPrice;
  return sum + (unit != null ? unit * item.quantity : 0);
}, 0);

const purchasedFromBudget = SEED_BUDGET_ITEMS.filter((item) =>
  ["purchased", "awaiting_delivery", "received", "installed"].includes(
    item.status
  )
).reduce((sum, item) => {
  const unit = item.actualPrice ?? item.estimatedPrice ?? 0;
  return sum + unit * item.quantity;
}, 0);

export const SEED_SUMMARY = {
  targetBudget: SEED_BUDGET_TARGET,
  estimatedBudget: estimatedFromBudget,
  purchasedBudget: purchasedFromBudget,
  plannedBudget: Math.max(estimatedFromBudget - purchasedFromBudget, 0),
  reserveBudget: Math.max(SEED_BUDGET_TARGET - estimatedFromBudget, 0),
  unevaluatedCount: SEED_BUDGET_ITEMS.filter((i) => i.estimatedPrice == null)
    .length,
  mustHaveCount: SEED_BUDGET_ITEMS.filter((i) => i.priority === "must").length,
  purchasedCount: SEED_BUDGET_ITEMS.filter((i) =>
    ["purchased", "awaiting_delivery", "received", "installed"].includes(
      i.status
    )
  ).length,
  waitingPriceCount: SEED_BUDGET_ITEMS.filter(
    (i) => i.status === "no_price" || i.status === "comparing"
  ).length,
  teamCount: SEED_TEAM.length,
};

export const SEED_NEXT_ACTIONS = [
  { id: "a1", label: "หาราคาป้ายร้าน", href: "/opening/budget" },
  { id: "a2", label: "เลือกผู้ขายตู้โชว์", href: "/opening/budget" },
  { id: "a3", label: "สรุปงบกับทีมบริหาร", href: "/opening/team" },
];

/* -------------------------------------------------------------------------- */
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

export const SEED_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "e1",
    at: "2026-07-11T14:20:00+07:00",
    person: "เก็ต",
    category: "รายการตรวจสอบ",
    item: "Packaging",
    action: "Checklist สำเร็จ",
    kind: "checklist",
    href: "/opening/checklist",
  },
  {
    id: "e2",
    at: "2026-07-11T11:30:00+07:00",
    person: "ครีม",
    category: "งบประมาณ",
    item: "ตู้โชว์",
    action: "เพิ่มใบเสนอราคา",
    kind: "quote",
    href: "/opening/budget",
  },
  {
    id: "e3",
    at: "2026-07-11T09:15:00+07:00",
    person: "เดย์",
    category: "งบประมาณ",
    item: "ป้ายร้าน",
    action: "เพิ่มงบประมาณ",
    kind: "budget_added",
    href: "/opening/budget",
  },
  {
    id: "e4",
    at: "2026-07-10T16:45:00+07:00",
    person: "เหมียว",
    category: "ทรัพย์สิน",
    item: "เตาโตเกียว",
    action: "ซื้อเตา",
    kind: "purchased",
    href: "/opening/assets",
  },
  {
    id: "e5",
    at: "2026-07-10T13:10:00+07:00",
    person: "เหมียว",
    category: "ทรัพย์สิน",
    item: "ถังแก๊ส",
    action: "เพิ่มอุปกรณ์",
    kind: "asset_added",
    href: "/opening/assets",
  },
  {
    id: "e6",
    at: "2026-07-10T10:05:00+07:00",
    person: "ครีม",
    category: "วัตถุดิบเริ่มต้น",
    item: "หมูหย็อง",
    action: "เพิ่มงบประมาณ",
    kind: "budget_added",
    href: "/opening/initial-stock",
  },
  {
    id: "e7",
    at: "2026-07-09T15:40:00+07:00",
    person: "เก็ต",
    category: "งบประมาณ",
    item: "POS",
    action: "เพิ่มใบเสนอราคา",
    kind: "quote",
    href: "/opening/budget",
  },
  {
    id: "e8",
    at: "2026-07-09T11:00:00+07:00",
    person: "เดย์",
    category: "ทีมบริหาร",
    item: "เหมียว",
    action: "เพิ่มหุ้นส่วน",
    kind: "partner_added",
    href: "/partners",
  },
  {
    id: "e9",
    at: "2026-07-09T09:20:00+07:00",
    person: "ครีม",
    category: "วัตถุดิบเริ่มต้น",
    item: "Nutella",
    action: "เพิ่มงบประมาณ",
    kind: "budget_added",
    href: "/opening/initial-stock",
  },
];

/* -------------------------------------------------------------------------- */
/* Documents                                                                  */
/* -------------------------------------------------------------------------- */

export const SEED_DOCUMENTS: OpeningDocument[] = [
  {
    id: "d1",
    parentType: "asset",
    parentId: "as1",
    parentName: "เตาโตเกียว",
    kind: "receipt",
    title: "ใบเสร็จซื้อเตาโตเกียว",
    detail: "4,200 บาท",
    person: "เหมียว",
    at: "2026-07-10T16:50:00+07:00",
  },
  {
    id: "d2",
    parentType: "asset",
    parentId: "as1",
    parentName: "เตาโตเกียว",
    kind: "warranty",
    title: "การรับประกัน 1 ปี",
    detail: "หมดอายุ 10 ก.ค. 2570",
    person: "เหมียว",
    at: "2026-07-10T16:52:00+07:00",
  },
  {
    id: "d3",
    parentType: "asset",
    parentId: "as1",
    parentName: "เตาโตเกียว",
    kind: "serial",
    title: "Serial Number",
    detail: "TG-2H-88421",
    person: "เดย์",
    at: "2026-07-10T17:05:00+07:00",
  },
  {
    id: "d4",
    parentType: "asset",
    parentId: "as1",
    parentName: "เตาโตเกียว",
    kind: "image",
    title: "รูปเตาโตเกียวหลังติดตั้ง",
    detail: "stove.jpg",
    person: "เก็ต",
    at: "2026-07-11T09:00:00+07:00",
  },
  {
    id: "d5",
    parentType: "budget",
    parentId: "i3",
    parentName: "ตู้โชว์",
    kind: "quote",
    title: "ใบเสนอราคา ตู้โชว์",
    detail: "กระจกใส · ส่งฟรีในเมือง",
    person: "ครีม",
    at: "2026-07-11T11:30:00+07:00",
  },
  {
    id: "d6",
    parentType: "budget",
    parentId: "i3",
    parentName: "ตู้โชว์",
    kind: "pdf",
    title: "สเปกตู้โชว์ PDF",
    detail: "showcase-spec.pdf",
    person: "ครีม",
    at: "2026-07-11T11:32:00+07:00",
  },
  {
    id: "d7",
    parentType: "budget",
    parentId: "i5",
    parentName: "ป้ายร้าน",
    kind: "image",
    title: "แบบป้ายร้านตั้งเตา",
    detail: "sign-mockup.png",
    person: "เดย์",
    at: "2026-07-11T09:20:00+07:00",
  },
  {
    id: "d8",
    parentType: "initial_stock",
    parentId: "st1",
    parentName: "หมูหย็อง",
    kind: "quote",
    title: "ใบเสนอราคา หมูหย็อง",
    detail: "360 บาท/กก.",
    person: "ครีม",
    at: "2026-07-09T14:00:00+07:00",
  },
  {
    id: "d9",
    parentType: "initial_stock",
    parentId: "st8",
    parentName: "Packaging",
    kind: "receipt",
    title: "ใบเสร็จ Packaging",
    detail: "2,350 บาท",
    person: "เก็ต",
    at: "2026-07-08T10:15:00+07:00",
  },
  {
    id: "d10",
    parentType: "asset",
    parentId: "as3",
    parentName: "POS",
    kind: "quote",
    title: "ใบเสนอราคา POS",
    detail: "แพ็กเกจเปิดร้าน",
    person: "เก็ต",
    at: "2026-07-09T15:40:00+07:00",
  },
];

export const SEED_QUOTES: QuoteDocument[] = [
  {
    id: "d5",
    parentType: "budget",
    parentId: "i3",
    parentName: "ตู้โชว์",
    kind: "quote",
    title: "ใบเสนอราคา ตู้โชว์",
    detail: "กระจกใส · ส่งฟรีในเมือง",
    person: "ครีม",
    at: "2026-07-11T11:30:00+07:00",
    vendor: "ร้านตู้เย็นทอง",
    amount: 11_500,
    validUntil: "2026-07-18",
  },
  {
    id: "d8",
    parentType: "initial_stock",
    parentId: "st1",
    parentName: "หมูหย็อง",
    kind: "quote",
    title: "ใบเสนอราคา หมูหย็อง",
    detail: "360 บาท/กก.",
    person: "ครีม",
    at: "2026-07-09T14:00:00+07:00",
    vendor: "ตลาดสดตั้งเตา",
    amount: 1_800,
    validUntil: "2026-07-12",
  },
  {
    id: "d10",
    parentType: "asset",
    parentId: "as3",
    parentName: "POS",
    kind: "quote",
    title: "ใบเสนอราคา POS",
    detail: "แพ็กเกจเปิดร้าน",
    person: "เก็ต",
    at: "2026-07-09T15:40:00+07:00",
    vendor: "SmartPOS โคราช",
    amount: 8_900,
    validUntil: "2026-07-20",
  },
];

/* -------------------------------------------------------------------------- */
/* Opening Calendar                                                           */
/* -------------------------------------------------------------------------- */

export const SEED_CALENDAR_TASKS: OpeningCalendarTask[] = [
  {
    id: "oc1",
    task: "ซื้อเตาโตเกียว",
    day: "2026-07-10",
    dayLabel: "10 ก.ค. 2569",
    deadline: "2026-07-10",
    deadlineLabel: "10 ก.ค.",
    status: "done",
    priority: "must",
    owner: "เหมียว",
  },
  {
    id: "oc2",
    task: "ติดตั้ง POS",
    day: "2026-07-14",
    dayLabel: "14 ก.ค. 2569",
    deadline: "2026-07-15",
    deadlineLabel: "15 ก.ค.",
    status: "in_progress",
    priority: "must",
    owner: "เก็ต",
  },
  {
    id: "oc3",
    task: "ทำป้ายร้าน",
    day: "2026-07-16",
    dayLabel: "16 ก.ค. 2569",
    deadline: "2026-07-18",
    deadlineLabel: "18 ก.ค.",
    status: "upcoming",
    priority: "must",
    owner: "เดย์",
  },
  {
    id: "oc4",
    task: "อบรมพนักงาน",
    day: "2026-07-20",
    dayLabel: "20 ก.ค. 2569",
    deadline: "2026-07-22",
    deadlineLabel: "22 ก.ค.",
    status: "upcoming",
    priority: "should",
    owner: "ครีม",
  },
  {
    id: "oc5",
    task: "Soft Opening",
    day: "2026-07-25",
    dayLabel: "25 ก.ค. 2569",
    deadline: "2026-07-25",
    deadlineLabel: "25 ก.ค.",
    status: "upcoming",
    priority: "must",
    owner: "เดย์",
  },
  {
    id: "oc6",
    task: "Grand Opening",
    day: "2026-08-01",
    dayLabel: "1 ส.ค. 2569",
    deadline: "2026-08-01",
    deadlineLabel: "1 ส.ค.",
    status: "upcoming",
    priority: "must",
    owner: "ทีมตั้งเตา",
  },
];

/* -------------------------------------------------------------------------- */
/* Decisions — Decision Queue (ไม่ใช่ Calendar)                                */
/* -------------------------------------------------------------------------- */

export const SEED_DECISIONS: DecisionItem[] = [
  {
    id: "d1",
    title: "เลือก POS",
    priority: "must",
    deadline: "2026-07-11",
    deadlineLabel: "วันนี้ · 11 ก.ค.",
    impact: "ถ้ายืดออก Soft Opening เลื่อน · ขายหน้าร้านและ Grab ไม่พร้อม",
    budgetLabel: "POS",
    budgetAmount: 8_500,
    action: "เลือกแพ็กเกจ SmartPOS หรือเทียบผู้ขายอื่น",
    href: "/opening/assets/as3",
    owner: "เก็ต",
  },
  {
    id: "d2",
    title: "เลือกตู้โชว์",
    priority: "must",
    deadline: "2026-07-12",
    deadlineLabel: "พรุ่งนี้ · 12 ก.ค.",
    impact: "หน้าร้านไม่มีจุดโชว์สินค้า · ลูกค้ามองไม่เห็นเมนูหลัก",
    budgetLabel: "ตู้โชว์",
    budgetAmount: 12_000,
    action: "ตัดสินใจจากใบเสนอราคา ร้านตู้เย็นทอง",
    href: "/opening/assets/as2",
    owner: "ครีม",
  },
  {
    id: "d3",
    title: "เลือกสีป้ายร้าน",
    priority: "must",
    deadline: "2026-07-14",
    deadlineLabel: "14 ก.ค.",
    impact: "ป้ายผลิตไม่ทัน · หน้าร้านยังไม่พร้อมเปิด",
    budgetLabel: "ป้ายร้าน",
    budgetAmount: null,
    action: "ล็อกสีและแบบป้ายตั้งเตา แล้วขอราคา",
    href: "/opening/budget",
    owner: "เดย์",
  },
  {
    id: "d4",
    title: "เลือก Packaging",
    priority: "should",
    deadline: "2026-07-15",
    deadlineLabel: "15 ก.ค.",
    impact: "Delivery / Grab แพ็กไม่สวย · ต้นทุนกล่องอาจบวม",
    budgetLabel: "Packaging",
    budgetAmount: 2_350,
    action: "ยืนยันสเปกกล่องที่สั่งไปแล้ว หรือเปลี่ยนรุ่น",
    href: "/opening/initial-stock",
    owner: "ครีม",
  },
  {
    id: "d5",
    title: "เลือก Supplier",
    priority: "should",
    deadline: "2026-07-16",
    deadlineLabel: "16 ก.ค.",
    impact: "หมูหย็อง / Nutella / ซอสพิซซ่า ของขาดวัน Soft Opening",
    budgetLabel: "วัตถุดิบเริ่มต้น",
    budgetAmount: 6_260,
    action: "ล็อก supplier หลักสำหรับวัตถุดิบเปิดร้าน",
    href: "/opening/initial-stock",
    owner: "ครีม",
  },
];

/* -------------------------------------------------------------------------- */
/* Quote Compare — UI only (ยังไม่คำนวณ)                                       */
/* -------------------------------------------------------------------------- */

export const SEED_QUOTE_COMPARE: QuoteCompareGroup[] = [
  {
    id: "qc-pos",
    itemName: "POS",
    href: "/opening/assets/as3",
    options: [
      {
        id: "qo1",
        vendor: "Sunmi",
        amount: 12_500,
        note: "เครื่องพิมพ์ในตัว · รับประกัน 1 ปี",
      },
      {
        id: "qo2",
        vendor: "Sunmi",
        amount: 16_800,
        note: "รุ่น Pro · หน้าจอใหญ่กว่า · สแกนเนอร์คู่",
      },
      {
        id: "qo3",
        vendor: "Android",
        amount: 11_900,
        note: "แพ็กเกจเปิดร้าน · ติดตั้งฟรีในเมือง",
      },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Business Readiness — Opening dashboard                                     */
/* -------------------------------------------------------------------------- */

export const SEED_BUSINESS_READINESS: ReadinessArea[] = [
  {
    id: "financial",
    title: "Financial",
    percent: 62,
    status: "working",
    hint: "งบ 120,000 · ยังมีรายการไม่มีราคา",
    href: "/opening/budget",
  },
  {
    id: "equipment",
    title: "Equipment",
    percent: 55,
    status: "working",
    hint: "เตาโตเกียวติดตั้งแล้ว · POS / ตู้โชว์ยังค้าง",
    href: "/opening/assets",
  },
  {
    id: "initial-stock",
    title: "Initial Stock",
    percent: 40,
    status: "working",
    hint: "หมูหย็อง Nutella ฯลฯ มีรายการแล้ว · ยังไม่สั่งครบ",
    href: "/opening/initial-stock",
  },
  {
    id: "team",
    title: "Team",
    percent: 100,
    status: "ready",
    hint: "เดย์ ครีม เก็ต เหมียว · สัดส่วน 100%",
    href: "/opening/team",
  },
  {
    id: "legal",
    title: "Legal",
    percent: 15,
    status: "blocked",
    hint: "เอกสารร้าน / ใบอนุญาตยังไม่ครบ",
    href: "/opening/documents",
  },
  {
    id: "marketing",
    title: "Marketing",
    percent: 35,
    status: "working",
    hint: "LINE OA เปิดตัวยังไม่ล็อกงบ",
    href: "/opening/budget",
  },
  {
    id: "packaging",
    title: "Packaging",
    percent: 70,
    status: "working",
    hint: "สั่งแล้ว · รอจัดส่ง",
    href: "/opening/initial-stock",
  },
];

export const READINESS_STATUS_LABELS: Record<ReadinessStatus, string> = {
  ready: "Ready",
  working: "Working",
  blocked: "Blocked",
};

/* -------------------------------------------------------------------------- */
/* Suppliers — for global search                                              */
/* -------------------------------------------------------------------------- */

export const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "sup1",
    name: "Makro",
    category: "วัตถุดิบ / Packaging",
    note: "หมูหย็อง · แป้ง · Packaging เปิดร้าน",
  },
  {
    id: "sup2",
    name: "Shopee",
    category: "อุปกรณ์ / ของใช้",
    note: "สั่งของเล็ก · เปรียบเทียบราคา",
  },
  {
    id: "sup3",
    name: "ตลาดสดตั้งเตา",
    category: "วัตถุดิบ",
    note: "ไข่ไก่ · ผัก · ของสดรายวัน",
  },
  {
    id: "sup4",
    name: "ร้านตู้เย็นทอง",
    category: "ทรัพย์สิน",
    note: "ใบเสนอราคาตู้โชว์",
  },
  {
    id: "sup5",
    name: "SmartPOS โคราช",
    category: "ระบบ POS",
    note: "ใบเสนอราคา POS",
  },
];

/* -------------------------------------------------------------------------- */
/* Compat aliases — keep existing OPENING_* / PARTNERS / TIMELINE names       */
/* -------------------------------------------------------------------------- */

export const OPENING_TEAM = SEED_TEAM;
export const OPENING_ASSETS = SEED_ASSETS;
export const OPENING_INITIAL_STOCK = SEED_INITIAL_STOCK;
export const OPENING_BUDGET_ITEMS = SEED_BUDGET_ITEMS;
export const OPENING_CHECKLIST = SEED_CHECKLIST;
export const OPENING_CATEGORIES = SEED_CATEGORIES;
export const OPENING_SUMMARY = SEED_SUMMARY;
export const OPENING_NEXT_ACTIONS = SEED_NEXT_ACTIONS;
export const PARTNERS = SEED_PARTNERS;
export const TIMELINE_EVENTS = SEED_TIMELINE_EVENTS;
export const OPENING_DOCUMENTS = SEED_DOCUMENTS;
export const OPENING_QUOTES = SEED_QUOTES;
export const OPENING_CALENDAR_TASKS = SEED_CALENDAR_TASKS;
export const DECISIONS = SEED_DECISIONS;
export const QUOTE_COMPARE_GROUPS = SEED_QUOTE_COMPARE;
export const BUSINESS_READINESS = SEED_BUSINESS_READINESS;
export const SUPPLIERS = SEED_SUPPLIERS;
