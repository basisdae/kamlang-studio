/**
 * UI-only mock catalog for /order flow review.
 * NEVER persist to Supabase / production tables.
 * Swap out by removing imports of this module when real catalog ships.
 */

import type { OrderProduct } from "./types";

export type ProductCategoryId =
  | "tokyo"
  | "sandwich"
  | "burger"
  | "ricebox";

export type TokyoFilterId =
  | "featured"
  | "bestsellers"
  | "regular"
  | "special";

export type MockOrderProduct = OrderProduct & {
  isMock: true;
  categoryId: ProductCategoryId;
  /** Solid color placeholder — replace with imageUrl later */
  placeholderColor: string;
  tokyo?: {
    featured: boolean;
    /** Lower number = higher bestseller rank; null = not in bestsellers */
    bestsellerRank: number | null;
    filling: "regular" | "special";
  };
};

export type CategoryTile = {
  id: ProductCategoryId;
  label: string;
  color: string;
};

export const MOCK_CATEGORY_TILES: CategoryTile[] = [
  { id: "tokyo", label: "โตเกียว", color: "#D71920" },
  { id: "sandwich", label: "แซนด์วิช", color: "#5C6370" },
  { id: "burger", label: "เบอร์เกอร์", color: "#8A4B2E" },
  { id: "ricebox", label: "ข้าวกล่อง", color: "#3D5A4A" },
];

export const TOKYO_FILTERS: { id: TokyoFilterId; label: string }[] = [
  { id: "featured", label: "แนะนำ" },
  { id: "bestsellers", label: "ขายดี" },
  { id: "regular", label: "ไส้ปกติ" },
  { id: "special", label: "ไส้พิเศษ" },
];

const MOCK_BADGE = "ข้อมูลตัวอย่าง";

function mockItem(
  partial: Omit<MockOrderProduct, "isMock" | "soldOut" | "imageUrl" | "price"> & {
    price?: number;
  }
): MockOrderProduct {
  return {
    ...partial,
    isMock: true,
    soldOut: false,
    imageUrl: null,
    price: partial.price ?? 0,
    description: MOCK_BADGE,
  };
}

/** 16 mock SKUs — frontend fixture only */
export const MOCK_ORDER_PRODUCTS: MockOrderProduct[] = [
  // Tokyo — mix tags so filters are testable
  mockItem({
    id: "mock-tokyo-1",
    name: "โตเกียวตัวอย่าง 1",
    categoryId: "tokyo",
    category: "โตเกียว",
    placeholderColor: "#F4A4A8",
    tokyo: { featured: true, bestsellerRank: 1, filling: "regular" },
  }),
  mockItem({
    id: "mock-tokyo-2",
    name: "โตเกียวตัวอย่าง 2",
    categoryId: "tokyo",
    category: "โตเกียว",
    placeholderColor: "#E88B90",
    tokyo: { featured: false, bestsellerRank: 2, filling: "regular" },
  }),
  mockItem({
    id: "mock-tokyo-3",
    name: "โตเกียวตัวอย่าง 3",
    categoryId: "tokyo",
    category: "โตเกียว",
    placeholderColor: "#C94A52",
    tokyo: { featured: true, bestsellerRank: 3, filling: "special" },
  }),
  mockItem({
    id: "mock-tokyo-4",
    name: "โตเกียวตัวอย่าง 4",
    categoryId: "tokyo",
    category: "โตเกียว",
    placeholderColor: "#A93038",
    tokyo: { featured: false, bestsellerRank: null, filling: "special" },
  }),

  mockItem({
    id: "mock-sandwich-1",
    name: "แซนด์วิชตัวอย่าง 1",
    categoryId: "sandwich",
    category: "แซนด์วิช",
    placeholderColor: "#B8BEC8",
  }),
  mockItem({
    id: "mock-sandwich-2",
    name: "แซนด์วิชตัวอย่าง 2",
    categoryId: "sandwich",
    category: "แซนด์วิช",
    placeholderColor: "#9AA3B0",
  }),
  mockItem({
    id: "mock-sandwich-3",
    name: "แซนด์วิชตัวอย่าง 3",
    categoryId: "sandwich",
    category: "แซนด์วิช",
    placeholderColor: "#7D8796",
  }),
  mockItem({
    id: "mock-sandwich-4",
    name: "แซนด์วิชตัวอย่าง 4",
    categoryId: "sandwich",
    category: "แซนด์วิช",
    placeholderColor: "#5C6572",
  }),

  mockItem({
    id: "mock-burger-1",
    name: "เบอร์เกอร์ตัวอย่าง 1",
    categoryId: "burger",
    category: "เบอร์เกอร์",
    placeholderColor: "#D4A07A",
  }),
  mockItem({
    id: "mock-burger-2",
    name: "เบอร์เกอร์ตัวอย่าง 2",
    categoryId: "burger",
    category: "เบอร์เกอร์",
    placeholderColor: "#C4895E",
  }),
  mockItem({
    id: "mock-burger-3",
    name: "เบอร์เกอร์ตัวอย่าง 3",
    categoryId: "burger",
    category: "เบอร์เกอร์",
    placeholderColor: "#A86B42",
  }),
  mockItem({
    id: "mock-burger-4",
    name: "เบอร์เกอร์ตัวอย่าง 4",
    categoryId: "burger",
    category: "เบอร์เกอร์",
    placeholderColor: "#8A4B2E",
  }),

  mockItem({
    id: "mock-rice-1",
    name: "ข้าวกล่องตัวอย่าง 1",
    categoryId: "ricebox",
    category: "ข้าวกล่อง",
    placeholderColor: "#8FB39A",
  }),
  mockItem({
    id: "mock-rice-2",
    name: "ข้าวกล่องตัวอย่าง 2",
    categoryId: "ricebox",
    category: "ข้าวกล่อง",
    placeholderColor: "#6F9A7C",
  }),
  mockItem({
    id: "mock-rice-3",
    name: "ข้าวกล่องตัวอย่าง 3",
    categoryId: "ricebox",
    category: "ข้าวกล่อง",
    placeholderColor: "#557A62",
  }),
  mockItem({
    id: "mock-rice-4",
    name: "ข้าวกล่องตัวอย่าง 4",
    categoryId: "ricebox",
    category: "ข้าวกล่อง",
    placeholderColor: "#3D5A4A",
  }),
];

export function getMockProductsByCategory(
  categoryId: ProductCategoryId
): MockOrderProduct[] {
  return MOCK_ORDER_PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function filterTokyoProducts(
  products: MockOrderProduct[],
  filter: TokyoFilterId
): MockOrderProduct[] {
  const tokyo = products.filter((p) => p.categoryId === "tokyo" && p.tokyo);
  switch (filter) {
    case "featured":
      return tokyo.filter((p) => p.tokyo?.featured);
    case "bestsellers":
      return tokyo
        .filter((p) => p.tokyo?.bestsellerRank != null)
        .sort(
          (a, b) =>
            (a.tokyo!.bestsellerRank as number) -
            (b.tokyo!.bestsellerRank as number)
        );
    case "regular":
      return tokyo.filter((p) => p.tokyo?.filling === "regular");
    case "special":
      return tokyo.filter((p) => p.tokyo?.filling === "special");
    default:
      return tokyo;
  }
}

export function getMockProductById(id: string): MockOrderProduct | undefined {
  return MOCK_ORDER_PRODUCTS.find((p) => p.id === id);
}

export function categoryLabel(id: ProductCategoryId): string {
  return MOCK_CATEGORY_TILES.find((t) => t.id === id)?.label ?? id;
}
