"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AppShell from "../../../components/layout/AppShell";
import BiDataStatus from "../../../components/bi/BiDataStatus";
import NextStepCard from "../../../components/bi/NextStepCard";
import OpeningSummaryCard from "../../../components/bi/OpeningSummaryCard";
import PageHeader from "../../../components/bi/PageHeader";
import RecommendationPanel from "../../../components/bi/RecommendationPanel";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryMetric from "../../../components/bi/SummaryMetric";
import ButtonLink from "../../../components/ui/ButtonLink";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import { useWorkspace } from "../../providers/WorkspaceProvider";
import { useAssets } from "../assets/AssetsProvider";
import {
  OPENING_TOPICS,
  buildOpeningSummary,
  nextOpeningFocus,
  topicProgress,
} from "../lib/openingDomain";
import { useModuleViewConfig } from "../../../lib/workspaces/moduleViewConfig";
import {
  MARKETING_TOPICS,
  buildMarketingSummary,
  marketingTopicProgress,
  nextMarketingFocus,
} from "../../../lib/marketing/marketingChecklist";

/**
 * Checklist index — Opening or Marketing Readiness via moduleViewConfig.
 * Same bi_assets Module; topics change by Workspace Context.
 */
export default function OpeningChecklistPage() {
  const { workspaceName } = useWorkspace();
  const view = useModuleViewConfig("opening-checklist");
  const marketingMode = view.summaryMode === "marketing";
  const {
    assets,
    loading,
    ready,
    online,
    configured,
    browserOffline,
    error,
    retry,
  } = useAssets();

  const openingSummary = useMemo(() => buildOpeningSummary(assets), [assets]);
  const marketingSummary = useMemo(
    () => buildMarketingSummary(assets),
    [assets]
  );
  const openingFocus = useMemo(() => nextOpeningFocus(assets), [assets]);
  const marketingFocus = useMemo(() => nextMarketingFocus(assets), [assets]);
  const topics = useMemo(() => {
    if (marketingMode) {
      return MARKETING_TOPICS.map((t) => marketingTopicProgress(assets, t));
    }
    return OPENING_TOPICS.map((t) => topicProgress(assets, t));
  }, [assets, marketingMode]);

  const backHref = marketingMode ? "/home" : "/opening";
  const focus = marketingMode ? marketingFocus : openingFocus;

  return (
    <AppShell title="" hidePageHeader compact backHref={backHref}>
      <PageHeader
        title={marketingMode ? "รายการเตรียมการตลาด" : "เปิดร้าน"}
        workspace={workspaceName}
        subtitle={
          marketingMode ? "Marketing Readiness" : "รายการเตรียมเปิดร้าน"
        }
      />
      <p className="kl-type-helper -mt-1">
        {marketingMode
          ? "การตลาดพร้อมแค่ไหนแล้ว"
          : "วันนี้ร้านยังต้องเตรียมอะไรบ้าง"}
      </p>

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={false}
        hasCachedData={false}
        sourceHint={
          loading
            ? "กำลังดึง bi_assets..."
            : online
              ? marketingMode
                ? "แหล่งข้อมูล: Supabase · Marketing Checklist"
                : "แหล่งข้อมูล: Supabase · รายการเตรียมเปิดร้าน"
              : error
                ? "แหล่งข้อมูล: โหลดไม่สำเร็จ"
                : "กำลังเชื่อมต่อ..."
        }
        skeletonRows={4}
        onRetry={() => void retry()}
      />

      {!loading && !error ? (
        <>
          <div className="kl-sticky-summary">
            {marketingMode ? (
              <div className="grid grid-cols-2 gap-2">
                <SummaryMetric
                  label="Marketing Ready"
                  value={`${marketingSummary.readyPercent}%`}
                  tone={
                    marketingSummary.readyPercent >= 100 ? "success" : "accent"
                  }
                />
                <SummaryMetric
                  label="เหลืออีก"
                  value={marketingSummary.remainingCount}
                  tone={
                    marketingSummary.remainingCount > 0 ? "accent" : "success"
                  }
                />
              </div>
            ) : (
              <OpeningSummaryCard summary={openingSummary} variant="compact" />
            )}
          </div>

          <NextStepCard
            message={focus.message}
            href={focus.href}
            actionLabel="ไปทำต่อ"
          />

          {marketingMode ? null : (
            <RecommendationPanel assets={assets} limit={4} />
          )}

          <section className="space-y-3">
            <SectionHeader title="หมวด" />
            <div className="space-y-2">
              {topics.map((row) => (
                <Link
                  key={row.topic.id}
                  href={row.topic.href}
                  className="kl-section block min-w-0 space-y-2 kl-pressable"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="kl-type-card-title min-w-0 truncate">
                      {row.topic.title}
                    </p>
                    <ChevronRight
                      className={`${KL_ICON_CLASS} shrink-0`}
                      strokeWidth={KL_ICON_STROKE}
                      aria-hidden
                    />
                  </div>
                  <p className="kl-type-helper">{row.topic.description}</p>
                  {"isExternal" in row && row.isExternal ? (
                    <p className="kl-type-caption">ไปหน้าจัดการ →</p>
                  ) : (
                    <>
                      <div className="kl-progress-track">
                        <div
                          className="kl-progress-fill"
                          style={{ width: `${row.percent}%` }}
                        />
                      </div>
                      <p className="kl-type-caption">
                        {row.total === 0
                          ? "ยังไม่มีรายการในหมวดนี้"
                          : marketingMode
                            ? `พร้อม ${row.ready}/${row.total}`
                            : `พร้อม ${row.ready}/${row.total} · ต้องจัดหา ${row.need} · สั่งแล้ว ${row.ordered}`}
                      </p>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </section>

          <ButtonLink href={backHref} variant="secondary" fullWidth>
            {marketingMode ? "กลับภาพรวมการตลาด" : "กลับภาพรวมเปิดร้าน"}
          </ButtonLink>
        </>
      ) : null}
    </AppShell>
  );
}
