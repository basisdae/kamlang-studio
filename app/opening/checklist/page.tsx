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

/**
 * Opening Checklist — workflow protagonist.
 * Same bi_assets as Hub / Budget / Assets views.
 */
export default function OpeningChecklistPage() {
  const { workspaceName } = useWorkspace();
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

  const summary = useMemo(() => buildOpeningSummary(assets), [assets]);
  const focus = useMemo(() => nextOpeningFocus(assets), [assets]);
  const topics = useMemo(
    () => OPENING_TOPICS.map((t) => topicProgress(assets, t)),
    [assets]
  );

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="เปิดร้าน"
        workspace={workspaceName}
        subtitle="รายการเตรียมเปิดร้าน"
      />
      <p className="kl-type-helper -mt-1">
        วันนี้ร้านยังต้องเตรียมอะไรบ้าง
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
              ? "แหล่งข้อมูล: Supabase · รายการเตรียมเปิดร้าน"
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
            <OpeningSummaryCard summary={summary} variant="compact" />
          </div>

          <NextStepCard
            message={focus.message}
            href={focus.href}
            actionLabel="ไปทำต่อ"
          />

          <RecommendationPanel assets={assets} limit={4} />

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
                  {row.isExternal ? (
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
                          : `พร้อม ${row.ready}/${row.total} · ต้องจัดหา ${row.need} · สั่งแล้ว ${row.ordered}`}
                      </p>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </section>

          {assets.length === 0 ? (
            <ButtonLink href="/opening/assets/new" fullWidth>
              + เพิ่มรายการ
            </ButtonLink>
          ) : null}

          <ButtonLink href="/opening" variant="secondary" fullWidth>
            กลับภาพรวมเปิดร้าน
          </ButtonLink>
        </>
      ) : null}
    </AppShell>
  );
}
