"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getNotificationCount } from "../../app/lib/notificationService";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import { getWorkspaceMobileTabNav } from "../../lib/workspaces/filterNavigation";
import AppNavMoreSheet from "./AppNavMoreSheet";
import {
  getNavIconStroke,
  isMoreNavActive,
  isNavActive,
  KL_ICON_CLASS,
  moreNavIcon,
  type NavigationItem,
} from "./navConfig";

const MoreIcon = moreNavIcon;

export default function AppNav() {
  const pathname = usePathname();
  const { config } = useAppWorkspace();
  const [moreOpenForPath, setMoreOpenForPath] = useState<string | null>(null);
  const isMoreOpen = moreOpenForPath === pathname;
  const visibleModules = config?.visibleModules ?? "all";

  const tabItems = useMemo(() => {
    const filtered = getWorkspaceMobileTabNav(visibleModules);
    // Prefer workspace landing as first tab when overview is present
    if (!config) return filtered;
    return filtered.map((item): NavigationItem => {
      if (item.id === "overview") {
        return {
          ...item,
          href: config.defaultLanding,
          title: config.label,
          shortTitle: "ภาพรวม",
        };
      }
      return item;
    });
  }, [visibleModules, config]);

  const [notificationCount, setNotificationCount] = useState(0);
  useEffect(() => {
    setNotificationCount(getNotificationCount());
  }, [pathname]);
  const isMoreActive = isMoreNavActive(pathname);

  return (
    <>
      <div className="kl-nav-dock">
        <nav className="kl-nav" aria-label="เมนูหลัก">
          <div className="kl-nav-inner">
            {tabItems.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              const Icon = item.icon;
              const label = item.shortTitle ?? item.title;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="kl-nav-item"
                  data-active={isActive}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative">
                    <Icon
                      className={KL_ICON_CLASS}
                      strokeWidth={getNavIconStroke()}
                    />
                    {item.id === "overview" && notificationCount > 0 ? (
                      <span className="kl-notification-dot">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    ) : null}
                    {item.badge != null && item.id !== "overview" ? (
                      <span className="kl-notification-dot">{item.badge}</span>
                    ) : null}
                  </span>
                  <span className="kl-nav-label">{label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              className="kl-nav-item"
              data-active={isMoreActive || isMoreOpen}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
              onClick={() =>
                setMoreOpenForPath((current) =>
                  current === pathname ? null : pathname
                )
              }
            >
              <MoreIcon className={KL_ICON_CLASS} strokeWidth={getNavIconStroke()} />
              <span className="kl-nav-label">เพิ่มเติม</span>
            </button>
          </div>
        </nav>
      </div>

      <AppNavMoreSheet
        isOpen={isMoreOpen}
        pathname={pathname}
        onClose={() => setMoreOpenForPath(null)}
      />
    </>
  );
}
