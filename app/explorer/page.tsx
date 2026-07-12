"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import WorkspaceLandingHeader from "../../components/workspaces/WorkspaceLandingHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useAppWorkspace } from "../providers/AppWorkspaceProvider";
import { APP_WORKSPACE_LIST } from "../../lib/workspaces/appWorkspaces";
import type { AppWorkspaceId } from "../../lib/workspaces/types";
import { useAssets } from "../opening/assets/AssetsProvider";
import { buildOpeningSummary } from "../opening/lib/openingDomain";
import { buildLabSummary } from "../../lib/workspaces/labSummary";
import { buildOperationsSummary } from "../../lib/workspaces/operationsSummary";
import { formatBaht } from "../opening/sampleData";

function workspaceBlurb(
  id: AppWorkspaceId,
  ctx: {
    openingReady: number;
    openingRemaining: number;
    opsNeed: number;
    labRecipes: number;
    moneyNeeded: number;
  }
): string {
  switch (id) {
    case "opening":
      return `พร้อม ${ctx.openingReady}% · เหลือ ${ctx.openingRemaining} รายการ`;
    case "operations":
      return ctx.opsNeed > 0
        ? `ต้องจัดซื้อ ${ctx.opsNeed} รายการ`
        : "จัดซื้อ · สต๊อก · ผลิต";
    case "lab":
      return `สูตร ${ctx.labRecipes} รายการ`;
    case "marketing":
      return "กำลังเริ่มต้น · ยังไม่มีแคมเปญ";
    case "finance":
      return `งบที่ต้องจัดหา ${formatBaht(ctx.moneyNeeded)}`;
    case "explorer":
      return "ดูทุกพื้นที่ในระบบ";
    default:
      return "";
  }
}

/**
 * Explorer — overview of every Workspace + Insight outside the set.
 */
export default function ExplorerLandingPage() {
  const router = useRouter();
  const { setWorkspace } = useAppWorkspace();
  const { assets, loading } = useAssets();

  const opening = useMemo(() => buildOpeningSummary(assets), [assets]);
  const lab = useMemo(() => buildLabSummary(), []);
  const ops = useMemo(() => buildOperationsSummary(assets), [assets]);

  const ctx = {
    openingReady: opening.readyPercent,
    openingRemaining: opening.remainingCount,
    opsNeed: ops.needBuyCount,
    labRecipes: lab.recipeCount,
    moneyNeeded: opening.moneyNeeded,
  };

  function enterWorkspace(id: AppWorkspaceId, landing: string) {
    setWorkspace(id);
    router.push(landing);
  }

  return (
    <AppShell title="" hidePageHeader compact>
      <WorkspaceLandingHeader
        mark="🌍"
        title="แสดงทุกพื้นที่"
        description="สำรวจ Workspace แล้วเข้าพื้นที่ทำงาน"
      />

      {loading ? (
        <p className="kl-type-helper">กำลังโหลดสรุปสั้น…</p>
      ) : null}

      <div className="space-y-2">
        {APP_WORKSPACE_LIST.filter((ws) => ws.id !== "explorer").map((ws) => (
          <Card key={ws.id} className="!p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="kl-type-card-title">
                  <span className="mr-1.5" aria-hidden>
                    {ws.mark}
                  </span>
                  {ws.label}
                </p>
                <p className="kl-type-helper mt-0.5">
                  {workspaceBlurb(ws.id, ctx)}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="shrink-0"
                onClick={() => enterWorkspace(ws.id, ws.defaultLanding)}
              >
                เข้า
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="!p-3 border border-[var(--kl-border)]">
        <div className="flex items-start gap-3">
          <Lightbulb
            className="kl-icon mt-0.5 shrink-0 text-kl-muted"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="kl-type-card-title">Business Insight</p>
            <p className="kl-type-helper mt-0.5">
              ไม่ใช่ Workspace — อ่านและวิเคราะห์จาก Shared Core
            </p>
            <Link
              href="/insight"
              className="mt-2 inline-block kl-type-label font-medium underline-offset-2 hover:underline"
            >
              ไป Business Insight
            </Link>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
