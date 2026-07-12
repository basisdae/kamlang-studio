"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import { getWorkspaceDesktopNav } from "../../lib/workspaces/filterNavigation";
import {
  getNavIconStroke,
  isNavActive,
  KL_ICON_CLASS,
} from "./navConfig";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { config } = useAppWorkspace();
  const visibleModules = config?.visibleModules ?? "all";
  const items = useMemo(
    () => getWorkspaceDesktopNav(visibleModules),
    [visibleModules]
  );

  return (
    <aside className="kl-sidebar" aria-label="เมนูหลัก">
      <div className="kl-sidebar-brand">
        <div className="kl-sidebar-brand-name">Business Insight</div>
        <div className="kl-sidebar-brand-workspace">ร้าน: ตั้งเตา</div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const href =
            item.id === "overview" && config?.defaultLanding
              ? config.defaultLanding
              : item.href;
          const active = isNavActive(pathname, href);
          const isInsight = item.id === "insight";
          const label =
            item.id === "overview" && config ? "ภาพรวม" : item.title;

          return (
            <Link
              key={item.id}
              href={href}
              className={`kl-sidebar-item ${
                isInsight ? "mt-2 border-t border-[var(--kl-border)] pt-2" : ""
              }`}
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
