"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getDesktopNavItems,
  getNavIconStroke,
  isNavActive,
  KL_ICON_CLASS,
} from "./navConfig";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const items = getDesktopNavItems();

  return (
    <aside className="kl-sidebar" aria-label="เมนูหลัก">
      <div className="kl-sidebar-brand">
        <div className="kl-sidebar-brand-name">Business Insight</div>
        <div className="kl-sidebar-brand-workspace">Workspace: ตั้งเตา</div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.href);
          const label = item.title;

          return (
            <Link
              key={item.id}
              href={item.href}
              className="kl-sidebar-item"
              data-active={active}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={KL_ICON_CLASS} strokeWidth={getNavIconStroke()} />
              <span className="min-w-0 truncate">{label}</span>
              {item.badge != null ? (
                <span className="ml-auto shrink-0 text-[length:var(--kl-type-label-size)] font-semibold">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
