"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import {
  APP_WORKSPACE_LIST,
  isLandingCompositionPath,
} from "../../lib/workspaces/appWorkspaces";
import { isPathInWorkspace } from "../../lib/workspaces/filterNavigation";
import type { AppWorkspaceId } from "../../lib/workspaces/types";
import { workspaceAccentStyle } from "../../lib/workspaces/workspaceAccent";
import { KL_ICON_SM_CLASS, KL_ICON_STROKE } from "../layout/navConfig";
import Button from "../ui/Button";
import Card from "../ui/Card";

/**
 * Workspace context control — full label always readable (never truncated).
 * Quiet secondary chrome: name left, chevron right; not a primary CTA.
 */
export default function WorkspaceSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { isHydrated, isWorkspaceSelected, config, setWorkspace, clearWorkspace } =
    useAppWorkspace();
  const [open, setOpen] = useState(false);

  const applyWorkspace = useCallback(
    (id: AppWorkspaceId) => {
      const next = APP_WORKSPACE_LIST.find((w) => w.id === id);
      if (!next) return;
      setWorkspace(id);
      setOpen(false);
      const pathAllowed = isPathInWorkspace(
        pathname,
        next.visibleModules,
        next.id
      );
      if (!pathAllowed || isLandingCompositionPath(pathname)) {
        router.replace(next.defaultLanding);
      }
    },
    [pathname, router, setWorkspace]
  );

  const exitWorkspace = useCallback(() => {
    clearWorkspace();
    setOpen(false);
    router.replace("/modes");
  }, [clearWorkspace, router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!isHydrated || !isWorkspaceSelected || !config) return null;
  if (pathname === "/modes" || pathname.startsWith("/modes/")) return null;

  const Icon = config.icon;

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center gap-2 py-0.5 kl-pressable"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`เปลี่ยน Workspace · ${config.label}`}
        onClick={() => setOpen(true)}
      >
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center text-kl-muted"
          aria-hidden
        >
          <Icon className={KL_ICON_SM_CLASS} strokeWidth={KL_ICON_STROKE} />
        </span>
        <span className="min-w-0 flex-1 whitespace-nowrap text-left kl-type-label font-medium text-kl-brown">
          {config.label}
        </span>
        <ChevronDown
          className={`${KL_ICON_SM_CLASS} shrink-0 text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            aria-label="ปิด"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="เปลี่ยน Workspace"
            className="relative z-10 mx-4 mb-6 w-full max-w-[var(--bi-app-width)] sm:mb-0"
          >
            <Card className="space-y-3 !p-4">
              <p className="kl-type-card-title">เปลี่ยน Workspace</p>
              <div className="max-h-[45vh] space-y-1.5 overflow-y-auto">
                {APP_WORKSPACE_LIST.map((ws) => {
                  const RowIcon = ws.icon;
                  const active = ws.id === config.id;
                  const rowStyle = workspaceAccentStyle(
                    ws.accent
                  ) as CSSProperties;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      className={`flex w-full min-h-[2.5rem] items-center gap-2 rounded-[var(--kl-radius-inner)] px-3 py-2 text-left kl-pressable ${
                        active ? "" : "bg-kl-surface"
                      }`}
                      style={
                        active
                          ? {
                              ...rowStyle,
                              background: "var(--ws-accent-soft)",
                            }
                          : undefined
                      }
                      aria-current={active ? "true" : undefined}
                      onClick={() => applyWorkspace(ws.id)}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)]"
                        style={{
                          ...rowStyle,
                          background: "var(--ws-accent-soft)",
                          color: "var(--ws-accent)",
                        }}
                        aria-hidden
                      >
                        <RowIcon
                          className={KL_ICON_SM_CLASS}
                          strokeWidth={KL_ICON_STROKE}
                        />
                      </span>
                      <span className="kl-type-body font-medium">
                        {ws.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button variant="secondary" fullWidth onClick={exitWorkspace}>
                ออกจาก Workspace
              </Button>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
