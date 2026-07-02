"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getNotificationCount } from "../../app/lib/notificationService";
import AppNavMoreSheet from "./AppNavMoreSheet";
import {
  getNavIconStroke,
  isMoreNavActive,
  isNavActive,
  KL_ICON_CLASS,
  moreNavIcon,
  primaryNavItems,
} from "./navConfig";

const MoreIcon = moreNavIcon;

export default function AppNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const notificationCount = useMemo(
    () => getNotificationCount(),
    [pathname]
  );
  const isMoreActive = isMoreNavActive(pathname);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="kl-nav-dock">
        <nav className="kl-nav" aria-label="เมนูหลัก">
          <div className="kl-nav-inner">
            {primaryNavItems.map((item) => {
              const isActive = isNavActive(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
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
                  </span>
                  <span className="kl-nav-label">{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              className="kl-nav-item"
              data-active={isMoreActive || isMoreOpen}
              aria-expanded={isMoreOpen}
              aria-haspopup="dialog"
              onClick={() => setIsMoreOpen((open) => !open)}
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
        onClose={() => setIsMoreOpen(false)}
      />
    </>
  );
}
