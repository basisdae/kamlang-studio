"use client";

import { useRouter } from "next/navigation";
import { APP_WORKSPACE_LIST } from "../../lib/workspaces/appWorkspaces";
import type { AppWorkspaceId } from "../../lib/workspaces/types";
import { KL_ICON_LG_CLASS, KL_ICON_STROKE } from "../layout/navConfig";
import Card from "../ui/Card";
import { useAppWorkspace } from "../../app/providers/AppWorkspaceProvider";

/**
 * First-run Workspace chooser — must be the first meaningful screen.
 */
export default function WorkspaceChooser() {
  const router = useRouter();
  const { setWorkspace } = useAppWorkspace();

  function choose(id: AppWorkspaceId, landing: string) {
    setWorkspace(id);
    router.replace(landing);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="kl-type-label">Business Insight</p>
        <h1 className="kl-type-page-title">
          วันนี้คุณอยากไปทำงานที่ไหน?
        </h1>
        <p className="kl-type-helper mx-auto max-w-sm">
          เลือก Workspace เพื่อเข้าโฟกัสงานนั้น — ข้อมูลชุดเดียวกันทั้งระบบ
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {APP_WORKSPACE_LIST.map((ws) => {
          const Icon = ws.icon;
          const lemon = ws.accent === "lemon";
          return (
            <button
              key={ws.id}
              type="button"
              onClick={() => choose(ws.id, ws.defaultLanding)}
              className="w-full text-left kl-pressable"
            >
              <Card
                className={`!p-4 ${
                  lemon
                    ? "border border-[var(--bi-lemon)] bg-[rgb(231_246_91/0.22)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)] bg-kl-surface">
                    <Icon
                      className={KL_ICON_LG_CLASS}
                      strokeWidth={KL_ICON_STROKE}
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="kl-type-card-title">
                      <span className="mr-1.5" aria-hidden>
                        {ws.mark}
                      </span>
                      {ws.label}
                    </p>
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
