"use client";

import { useMemo } from "react";
import { Store } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import BiDataStatus from "../../components/bi/BiDataStatus";
import SummaryMetric from "../../components/bi/SummaryMetric";
import WorkspaceLandingHeader from "../../components/workspaces/WorkspaceLandingHeader";
import ButtonLink from "../../components/ui/ButtonLink";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { useAssets } from "../opening/assets/AssetsProvider";
import { buildOperationsSummary } from "../../lib/workspaces/operationsSummary";
import { getProductionStatusLabel } from "../production/utils";
import type { ProductionPlanStatus } from "../production/types";

export default function OperationsLandingPage() {
  const {
    configured,
    browserOffline,
    retry: retryWs,
  } = useWorkspace();
  const {
    assets,
    loading,
    ready,
    online,
    error,
    retry: retryAssets,
  } = useAssets();

  const summary = useMemo(
    () => buildOperationsSummary(assets),
    [assets]
  );

  const showStatus =
    !configured || browserOffline || Boolean(error);

  const hasAnySignal =
    summary.needBuyCount > 0 ||
    summary.orderedCount > 0 ||
    summary.receivedCount > 0 ||
    summary.inventorySkuCount > 0 ||
    summary.hasTodayPlan ||
    summary.todayPurchaseLines > 0;

  const retry = async () => {
    await retryWs();
    await retryAssets();
  };

  return (
    <AppShell title="" hidePageHeader compact>
      <WorkspaceLandingHeader
        mark="🏪"
        title="ดำเนินกิจการ"
        description="จัดซื้อ · สต๊อก · ผลิต"
      />

      {showStatus ? (
        <BiDataStatus
          loading={false}
          ready={ready}
          configured={configured}
          online={online}
          browserOffline={browserOffline}
          error={error}
          skeleton={false}
          onRetry={() => void retry()}
        />
      ) : null}

      {loading ? (
        <Card className="!p-4">
          <p className="kl-type-helper">กำลังโหลดข้อมูลจัดซื้อ…</p>
        </Card>
      ) : null}

      {!loading && !error && !hasAnySignal ? (
        <EmptyState
          icon={Store}
          title="ยังไม่มีงาน Operations วันนี้"
          hint="เริ่มจากจัดซื้อ สต๊อก หรือวางแผนผลิต — ไม่มีตัวเลขสมมติในหน้านี้"
          actionLabel="ไปจัดซื้อ"
          actionHref="/purchase"
        />
      ) : null}

      {!loading && !error && hasAnySignal ? (
        <Card className="space-y-3 !p-3">
          <div className="grid grid-cols-2 gap-2">
            <SummaryMetric
              label="ต้องจัดซื้อ"
              value={summary.needBuyCount}
              hint="จากรายการจัดหา"
            />
            <SummaryMetric label="สั่งแล้ว" value={summary.orderedCount} />
            <SummaryMetric label="รับแล้ว" value={summary.receivedCount} />
            <SummaryMetric
              label="วัตถุดิบในสต๊อก"
              value={summary.inventorySkuCount}
              hint={`มาสเตอร์ ${summary.ingredientMasterCount}`}
            />
          </div>
          <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2">
            <p className="kl-type-caption">แผนผลิตล่าสุด</p>
            {summary.latestPlanLabel ? (
              <p className="kl-type-body mt-0.5 font-medium">
                {summary.latestPlanLabel}
                {summary.latestPlanStatus
                  ? ` · ${getProductionStatusLabel(summary.latestPlanStatus as ProductionPlanStatus)}`
                  : null}
              </p>
            ) : (
              <p className="kl-type-helper mt-0.5">ยังไม่มีแผนวันนี้</p>
            )}
            {summary.todayPurchaseLines > 0 ? (
              <p className="kl-type-caption mt-1">
                รายการรอรับวันนี้ {summary.todayPurchaseBought}/
                {summary.todayPurchaseLines} ซื้อแล้ว
              </p>
            ) : null}
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <ButtonLink href="/purchase" fullWidth>
          ไปจัดซื้อ
        </ButtonLink>
        <ButtonLink href="/inventory" variant="secondary" fullWidth>
          ดูสต๊อก
        </ButtonLink>
        <ButtonLink href="/production" variant="secondary" fullWidth>
          วางแผนผลิต
        </ButtonLink>
      </div>
    </AppShell>
  );
}
