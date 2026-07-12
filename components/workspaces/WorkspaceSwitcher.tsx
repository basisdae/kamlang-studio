"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import {
  APP_WORKSPACE_LIST,
  getWorkspaceIdForLandingPath,
} from "../../lib/workspaces/appWorkspaces";
import { isPathInWorkspace } from "../../lib/workspaces/filterNavigation";
import type { AppWorkspaceId } from "../../lib/workspaces/types";
import { KL_ICON_SM_CLASS, KL_ICON_STROKE } from "../layout/navConfig";
import Button from "../ui/Button";
import Card from "../ui/Card";

/**
 * Compact single-line Workspace control — data-first header.
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
      const landingOwner = getWorkspaceIdForLandingPath(pathname);
      const onOtherWorkspaceHub =
        landingOwner != null && landingOwner !== next.id;
      const pathAllowed = isPathInWorkspace(
        pathname,
        next.visibleModules,
        next.id
      );
      if (!pathAllowed || onOtherWorkspaceHub) {
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

  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 bg-kl-ivory/95 px-4 py-1.5 backdrop-blur-sm sm:-mx-5 sm:px-5">
        <button
          type="button"
          className="inline-flex min-h-[2.25rem] max-w-full items-center gap-1.5 rounded-full border border-[var(--kl-border)] bg-kl-card px-3 kl-pressable"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`Workspace: ${config.label}`}
          onClick={() => setOpen(true)}
        >
          <span className="text-[1rem] leading-none" aria-hidden>
            {config.mark}
          </span>
          <span className="truncate kl-type-label font-medium">
            {config.label}
          </span>
          <ChevronDown
            className={`${KL_ICON_SM_CLASS} shrink-0 text-kl-muted`}
            strokeWidth={KL_ICON_STROKE}
            aria-hidden
          />
        </button>
      </div>

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
                  const active = ws.id === config.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      className={`flex w-full min-h-[2.5rem] items-center gap-2 rounded-[var(--kl-radius-inner)] px-3 py-2 text-left kl-pressable ${
                        active ? "bg-[var(--bi-lemon)]" : "bg-kl-surface"
                      }`}
                      aria-current={active ? "true" : undefined}
                      onClick={() => applyWorkspace(ws.id)}
                    >
                      <span aria-hidden>{ws.mark}</span>
                      <span className="kl-type-body font-medium">{ws.label}</span>
                    </button>
                  );
                })}
              </div>
              <Button variant="secondary" fullWidth onClick={exitWorkspace}>
                ออกจากโหมดนี้
              </Button>
            </Card>
          </div>
        </div>
      ) : null}
    </>
  );
}
