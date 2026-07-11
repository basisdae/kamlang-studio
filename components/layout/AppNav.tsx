"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { getNotificationCount } from "../../app/lib/notificationService";
import AppNavMoreSheet from "./AppNavMoreSheet";
import {
  getMobileTabItems,
  getNavIconStroke,
  isMoreNavActive,
  isNavActive,
  KL_ICON_CLASS,
  moreNavIcon,
} from "./navConfig";

const MoreIcon = moreNavIcon;

export default function AppNav() {
  const pathname = usePathname();
  const [moreOpenForPath, setMoreOpenForPath] = useState<string | null>(null);
  const isMoreOpen = moreOpenForPath === pathname;
  const tabItems = getMobileTabItems();
  const notificationCount = useMemo(
    () => getNotificationCount(),
    // Recompute when route changes (localStorage-backed counts)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname]
  );
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
                    {item.href === "/" && notificationCount > 0 ? (
                      <span className="kl-notification-dot">
                        {notificationCount > 9 ? "9+" : notificationCount}
                      </span>
                    ) : null}
                    {item.badge != null && item.href !== "/" ? (
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
