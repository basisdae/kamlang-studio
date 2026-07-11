"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import {
  getLegacyNavItems,
  getMobileMoreItems,
  getNavIconStroke,
  isNavActive,
  KL_ICON_CLASS,
  type NavigationItem,
} from "./navConfig";

type Props = {
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
};

function MoreNavRow({
  item,
  pathname,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  const isActive = isNavActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="kl-nav-more-row kl-pressable"
      aria-current={isActive ? "page" : undefined}
    >
      <span className="kl-nav-more-icon">
        <Icon className={KL_ICON_CLASS} strokeWidth={getNavIconStroke()} />
      </span>
      <span className="min-w-0 flex-1 text-[length:var(--kl-text-body)] font-medium">
        {item.title}
      </span>
      {item.badge != null ? (
        <span className="kl-type-label shrink-0">{item.badge}</span>
      ) : null}
      <ChevronRight
        className={`${KL_ICON_CLASS} text-kl-muted`}
        strokeWidth={getNavIconStroke()}
      />
    </Link>
  );
}

export default function AppNavMoreSheet({ isOpen, pathname, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const moreItems = getMobileMoreItems();
  const legacyItems = getLegacyNavItems();

  return (
    <>
      <button
        type="button"
        aria-label="ปิดเมนูเพิ่มเติม"
        className="fixed inset-0 z-[54] kl-sheet-scrim"
        onClick={onClose}
      />

      <div className="kl-nav-more-sheet" role="dialog" aria-label="เมนูเพิ่มเติม">
        <div className="kl-nav-more-panel max-h-[70vh] overflow-y-auto">
          <div className="px-5 py-4">
            <div className="kl-text-body font-semibold">เพิ่มเติม</div>
          </div>
          <nav>
            {moreItems.map((item) => (
              <MoreNavRow
                key={item.id}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
              />
            ))}
          </nav>

          <div className="border-t border-[var(--kl-border)] px-5 py-3">
            <div className="kl-type-label">Legacy</div>
            <p className="kl-type-helper mt-1">
              เครื่องมือครัวจาก Kamlang Studio — เก็บไว้ใช้ต่อ
            </p>
          </div>
          <nav>
            {legacyItems.map((item) => (
              <MoreNavRow
                key={item.id}
                item={item}
                pathname={pathname}
                onNavigate={onClose}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
