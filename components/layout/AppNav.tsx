"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const [moreOpenForPath, setMoreOpenForPath] = useState<string | null>(null);
  const isMoreOpen = moreOpenForPath === pathname;
  const visibleModules = config?.visibleModules ?? "all";

  const tabItems = useMemo(() => {
    const filtered = getWorkspaceMobileTabNav(visibleModules);
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

  // Close More when route changes; never keep a sticky open/active look
  useEffect(() => {
    setMoreOpenForPath(null);
  }, [pathname]);

  const isMoreActive = isMoreNavActive(pathname, tabItems);

  const closeMore = () => {
    setMoreOpenForPath(null);
    // Drop sticky keyboard / tap focus so yellow Active cannot linger
    moreBtnRef.current?.blur();
  };

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
                  data-active={isActive ? "true" : "false"}
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
              ref={moreBtnRef}
              type="button"
              className="kl-nav-item"
              data-active={isMoreActive ? "true" : "false"}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
              aria-current={isMoreActive ? "page" : undefined}
              onClick={() =>
                setMoreOpenForPath((current) =>
                  current === pathname ? null : pathname
                )
              }
            >
              <MoreIcon
                className={KL_ICON_CLASS}
                strokeWidth={getNavIconStroke()}
              />
              <span className="kl-nav-label">เพิ่มเติม</span>
            </button>
          </div>
        </nav>
      </div>

      <AppNavMoreSheet
        isOpen={isMoreOpen}
        pathname={pathname}
        onClose={closeMore}
      />
    </>
  );
}
