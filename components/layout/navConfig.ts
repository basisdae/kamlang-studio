import type { LucideIcon } from "lucide-react";
import {
  Beef,
  ClipboardList,
  CalendarDays,
  FileText,
  Handshake,
  Scale,
  GitCompare,
  Home,
  LayoutGrid,
  Lightbulb,
  Map,
  Package,
  PackageOpen,
  Search,
  Settings,
  ShoppingCart,
  Soup,
  History,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";

/**
 * Extensible navigation model.
 * Add Finance / Reports / Timeline later without rewriting Sidebar.
 */
export type NavigationItem = {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  /** Show in mobile chrome (tab bar and/or More sheet) */
  mobile?: boolean;
  /** Show in desktop sidebar */
  desktop?: boolean;
  badge?: number | string;
  children?: NavigationItem[];
  /**
   * When mobile=true:
   * - "tab" → bottom navigation
   * - "more" → More sheet (default)
   */
  mobilePlacement?: "tab" | "more";
  /** Shorter label for bottom tabs when title is long */
  shortTitle?: string;
  /** Grouping for More sheet sections */
  group?: "default" | "legacy";
};

export const navigationItems: NavigationItem[] = [
  {
    id: "overview",
    title: "ภาพรวม",
    href: "/",
    icon: Home,
    mobile: true,
    desktop: true,
    mobilePlacement: "tab",
  },
  {
    id: "opening",
    title: "แผนเปิดร้าน",
    href: "/opening",
    icon: Map,
    mobile: true,
    desktop: true,
    mobilePlacement: "tab",
    children: [
      {
        id: "opening-budget",
        title: "งบประมาณ",
        href: "/opening/budget",
        icon: Wallet,
        mobile: true,
        desktop: true,
        mobilePlacement: "more",
      },
      {
        id: "opening-assets",
        title: "ทรัพย์สิน",
        href: "/opening/assets",
        icon: Wrench,
        mobile: true,
        desktop: true,
        mobilePlacement: "more",
      },
      {
        id: "opening-initial-stock",
        title: "วัตถุดิบเริ่มต้น",
        href: "/opening/initial-stock",
        icon: PackageOpen,
        mobile: true,
        desktop: true,
        mobilePlacement: "more",
      },
      {
        id: "opening-team",
        title: "ทีมบริหาร",
        href: "/opening/team",
        icon: Users,
        mobile: true,
        desktop: true,
        mobilePlacement: "more",
      },
      {
        id: "opening-checklist",
        title: "รายการตรวจสอบ",
        href: "/opening/checklist",
        icon: ClipboardList,
        mobile: true,
        desktop: false,
        mobilePlacement: "more",
      },
      {
        id: "opening-documents",
        title: "เอกสาร",
        href: "/opening/documents",
        icon: FileText,
        mobile: true,
        desktop: true,
        mobilePlacement: "more",
      },
      {
        id: "opening-calendar",
        title: "Opening Timeline",
        href: "/opening/calendar",
        icon: CalendarDays,
        mobile: true,
        desktop: true,
        mobilePlacement: "more",
      },
    ],
  },
  {
    id: "insight",
    title: "Business Insight",
    shortTitle: "Insight",
    href: "/insight",
    icon: Lightbulb,
    mobile: true,
    desktop: true,
    mobilePlacement: "tab",
  },
  {
    id: "timeline",
    title: "Timeline",
    href: "/timeline",
    icon: History,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "partners",
    title: "Partners",
    href: "/partners",
    icon: Handshake,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "decisions",
    title: "Decisions",
    href: "/decisions",
    icon: Scale,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "quotes",
    title: "Quote Compare",
    href: "/quotes",
    icon: GitCompare,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "search",
    title: "ค้นหา",
    href: "/search",
    icon: Search,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "purchase",
    title: "การจัดซื้อ",
    href: "/purchase",
    icon: ShoppingCart,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "ingredients",
    title: "วัตถุดิบ",
    href: "/ingredients",
    icon: Beef,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "recipes",
    title: "สูตร",
    href: "/recipes",
    icon: Soup,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "settings",
    title: "ตั้งค่า",
    href: "/settings",
    icon: Settings,
    mobile: true,
    desktop: true,
    mobilePlacement: "more",
  },
  {
    id: "today-ops",
    title: "แผนครัววันนี้",
    href: "/today-ops",
    icon: Home,
    mobile: true,
    desktop: false,
    mobilePlacement: "more",
    group: "legacy",
  },
  {
    id: "production",
    title: "แผนผลิต",
    href: "/production",
    icon: ClipboardList,
    mobile: true,
    desktop: false,
    mobilePlacement: "more",
    group: "legacy",
  },
  {
    id: "menus",
    title: "เมนูขาย",
    href: "/menus",
    icon: UtensilsCrossed,
    mobile: true,
    desktop: false,
    mobilePlacement: "more",
    group: "legacy",
  },
  {
    id: "inventory",
    title: "ของในครัว",
    href: "/inventory",
    icon: Package,
    mobile: true,
    desktop: false,
    mobilePlacement: "more",
    group: "legacy",
  },
  {
    id: "today",
    title: "เช็คลิสต์พนักงาน",
    href: "/today",
    icon: ClipboardList,
    mobile: true,
    desktop: false,
    mobilePlacement: "more",
    group: "legacy",
  },
];

function flattenNavigation(
  items: NavigationItem[],
  predicate: (item: NavigationItem) => boolean
): NavigationItem[] {
  const result: NavigationItem[] = [];

  for (const item of items) {
    if (predicate(item)) {
      result.push(item);
    }
    if (item.children?.length) {
      result.push(...flattenNavigation(item.children, predicate));
    }
  }

  return result;
}

/** Bottom tab items (excludes the More button itself) */
export function getMobileTabItems(): NavigationItem[] {
  return flattenNavigation(
    navigationItems,
    (item) => Boolean(item.mobile) && item.mobilePlacement === "tab"
  );
}

/** More sheet — default (non-legacy) entries */
export function getMobileMoreItems(): NavigationItem[] {
  return flattenNavigation(
    navigationItems,
    (item) =>
      Boolean(item.mobile) &&
      item.mobilePlacement !== "tab" &&
      item.group !== "legacy"
  );
}

/** More sheet — Legacy Kamlang tools */
export function getLegacyNavItems(): NavigationItem[] {
  return flattenNavigation(
    navigationItems,
    (item) => Boolean(item.mobile) && item.group === "legacy"
  );
}

/**
 * Desktop sidebar rows.
 * Parents with children are listed, then each desktop child.
 */
export function getDesktopNavItems(): NavigationItem[] {
  const rows: NavigationItem[] = [];

  for (const item of navigationItems) {
    if (item.desktop) {
      rows.push(item);
    }
    if (item.children?.length) {
      for (const child of item.children) {
        if (child.desktop) {
          rows.push(child);
        }
      }
    }
  }

  return rows;
}

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

  if (href === "/opening") {
    return pathname === "/opening";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isMoreNavActive(pathname: string) {
  return (
    getMobileMoreItems().some((item) => isNavActive(pathname, item.href)) ||
    getLegacyNavItems().some((item) => isNavActive(pathname, item.href))
  );
}

/** @deprecated Prefer NavigationItem + helpers above */
export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function toLegacyNavItem(item: NavigationItem): NavItem {
  return { href: item.href, label: item.title, icon: item.icon };
}

/** @deprecated Use getMobileTabItems() */
export const primaryNavItems: NavItem[] =
  getMobileTabItems().map(toLegacyNavItem);

/** @deprecated Use getDesktopNavItems() */
export const desktopNavItems: NavItem[] =
  getDesktopNavItems().map(toLegacyNavItem);

/** @deprecated Use getMobileMoreItems() */
export const moreNavItems: NavItem[] =
  getMobileMoreItems().map(toLegacyNavItem);

/** @deprecated Use getLegacyNavItems() */
export const legacyNavItems: NavItem[] =
  getLegacyNavItems().map(toLegacyNavItem);
