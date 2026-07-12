"use client";

import { useRouter } from "next/navigation";
import type { CSSProperties } from "react";
import { APP_WORKSPACE_LIST } from "../../lib/workspaces/appWorkspaces";
import type { AppWorkspaceId } from "../../lib/workspaces/types";
import { workspaceAccentStyle } from "../../lib/workspaces/workspaceAccent";
import { KL_ICON_LG_CLASS, KL_ICON_STROKE } from "../layout/navConfig";
import Card from "../ui/Card";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";
import { useCurrentBusiness } from "../../app/providers/CurrentBusinessProvider";

/**
 * Workspace Chooser (Entry) — Business + cards only.
 * No Switcher on this screen.
 */
export default function WorkspaceChooser() {
  const router = useRouter();
  const { setWorkspace } = useAppWorkspace();
  const { currentBusiness } = useCurrentBusiness();

  function choose(id: AppWorkspaceId, landing: string) {
    setWorkspace(id);
    router.replace(landing);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="kl-type-label">Business: {currentBusiness.name}</p>
        <h1 className="kl-type-page-title">
          วันนี้คุณอยากไปทำงานที่ไหน?
        </h1>
        <p className="kl-type-helper mx-auto max-w-sm">
          เลือก Workspace เพื่อเริ่มงาน — Module เป็นของ Platform
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {APP_WORKSPACE_LIST.map((ws) => {
          const Icon = ws.icon;
          const accentStyle = workspaceAccentStyle(
            ws.accent
          ) as CSSProperties;
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => choose(ws.id, ws.defaultLanding)}
              className="w-full text-left kl-pressable"
            >
              <Card
                className="!p-4 border"
                style={{
                  ...accentStyle,
                  borderColor:
                    "color-mix(in srgb, var(--ws-accent) 35%, var(--kl-border))",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)]"
                    style={{
                      background: "var(--ws-accent-soft)",
                      color: "var(--ws-accent)",
                    }}
                  >
                    <Icon
                      className={KL_ICON_LG_CLASS}
                      strokeWidth={KL_ICON_STROKE}
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="kl-type-card-title">{ws.label}</p>
                    <p className="kl-type-helper mt-0.5">{ws.description}</p>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
