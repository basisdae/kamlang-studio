import type { KlCurrencyCode } from "./types";

export const RESTAURANT_TYPE_OPTIONS = [
  { value: "อาหารตามสั่ง", label: "อาหารตามสั่ง" },
  { value: "ก๋วยเตี๊ยว / เส้น", label: "ก๋วยเตี๊ยว / เส้น" },
  { value: "ข้าวแกง / ข้าวราดแกง", label: "ข้าวแกง / ข้าวราดแกง" },
  { value: "คาเฟ่ / ร้านกาแฟ", label: "คาเฟ่ / ร้านกาแฟ" },
  { value: "ขนม / เบเกอรี่", label: "ขนม / เบเกอรี่" },
  { value: "อาหารจานด่วน", label: "อาหารจานด่วน" },
  { value: "อื่นๆ", label: "อื่นๆ" },
] as const;

export const CURRENCY_OPTIONS: Array<{
  value: KlCurrencyCode;
  label: string;
}> = [
  { value: "THB", label: "บาท (THB)" },
  { value: "USD", label: "ดอลลาร์ (USD)" },
];

export const DEFAULT_GP_PERCENT = 65;
