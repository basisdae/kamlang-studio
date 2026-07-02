import type { LucideIcon } from "lucide-react";
import {
  Beef,
  ClipboardList,
  Home,
  LayoutGrid,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Soup,
  UtensilsCrossed,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const primaryNavItems: NavItem[] = [
  { href: "/", label: "หน้าแรก", icon: Home },
  { href: "/production", label: "แผนผลิต", icon: ClipboardList },
  { href: "/purchase", label: "ซื้อของ", icon: ShoppingCart },
  { href: "/recipes", label: "สูตร", icon: Soup },
];

export const moreNavItems: NavItem[] = [
  { href: "/menus", label: "เมนูขาย", icon: UtensilsCrossed },
  { href: "/ingredients", label: "วัตถุดิบ", icon: Beef },
  { href: "/inventory", label: "สต๊อก", icon: Package },
  { href: "/search", label: "ค้นหา", icon: Search },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
];

export const moreNavIcon = LayoutGrid;

export const KL_ICON_CLASS = "kl-icon";
export const KL_ICON_SM_CLASS = "kl-icon-sm";
export const KL_ICON_LG_CLASS = "kl-icon-lg";
export const KL_ICON_XL_CLASS = "kl-icon-xl";
export const KL_ICON_DISPLAY_CLASS = "kl-icon-display";
export const KL_ICON_DISPLAY_LG_CLASS = "kl-icon-display-lg";
export const KL_ICON_STROKE = 1.75;

export function getNavIconStroke() {
  return KL_ICON_STROKE;
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMoreNavActive(pathname: string) {
  return moreNavItems.some((item) => isNavActive(pathname, item.href));
}
