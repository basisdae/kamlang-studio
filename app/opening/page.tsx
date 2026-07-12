"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import BiDataStatus from "../../components/bi/BiDataStatus";
import NextStepCard from "../../components/bi/NextStepCard";
import OpeningSummaryCard from "../../components/bi/OpeningSummaryCard";
import PageHeader from "../../components/bi/PageHeader";
import SectionHeader from "../../components/bi/SectionHeader";
import ButtonLink from "../../components/ui/ButtonLink";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../components/layout/navConfig";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { useAssets } from "./assets/AssetsProvider";
import {
  OPENING_TOPICS,
  buildOpeningSummary,
  nextOpeningFocus,
  topicProgress,
} from "./lib/openingDomain";

/**
 * Opening Hub = Dashboard
 * Summary / Ready = result on this page
 * Checklist = workflow (separate route)
 */
export default function OpeningHubPage() {
  const {
    workspaceName,
    loading: wsLoading,
    configured,
    online: wsOnline,
    browserOffline,
    error: wsError,
    retry: retryWs,
  } = useWorkspace();
  const {
    assets,
    loading: assetsLoading,
    ready: assetsReady,
    online: assetsOnline,
    error: assetsError,
    retry: retryAssets,
  } = useAssets();

  const summary = useMemo(() => buildOpeningSummary(assets), [assets]);
  const focus = useMemo(() => nextOpeningFocus(assets), [assets]);
  const topics = useMemo(
    () => OPENING_TOPICS.map((t) => topicProgress(assets, t)),
    [assets]
  );
  const blockers = useMemo(
    () =>
      topics.filter((p) => !p.isExternal && p.remaining > 0),
    [topics]
  );

  const loading = wsLoading || assetsLoading;
  const ready = !wsLoading && assetsReady;
  const online = wsOnline && assetsOnline;
  const error = wsError ?? assetsError;

  const isShopReady =
    summary.totalCount > 0 &&
    summary.remainingCount === 0 &&
    summary.noPriceCount === 0;

  const retry = async () => {
    await retryWs();
    await retryAssets();
  };

  return (
    <AppShell title="" hidePageHeader compact>
      <PageHeader
        title="เปิดร้าน"
        workspace={workspaceName}
        subtitle="ภาพรวม"
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
          online
            ? `แหล่งข้อมูล: Supabase · ${summary.totalCount} รายการ`
            : error
              ? "แหล่งข้อมูล: โหลดไม่สำเร็จ"
              : "กำลังเชื่อมต่อ..."
        }
        skeleton={false}
        onRetry={() => void retry()}
      />

      {!loading && !error ? (
        <>
          <section className="space-y-2">
            <SectionHeader title="พร้อมเปิดหรือยัง" />
            <p className="kl-type-card-title">
              {isShopReady
                ? "รายการหลักพร้อมแล้ว — ตรวจทีมและเอกสารครั้งสุดท้าย"
                : "ยังไม่พร้อมเปิด — เคลียร์รายการที่ค้างก่อน"}
            </p>
          </section>

          <OpeningSummaryCard
            summary={summary}
            variant="full"
            title="สรุปความพร้อม"
          />

          <NextStepCard
            message={focus.message}
            href={focus.href}
            actionLabel="ไปทำต่อ"
          />

          {blockers.length > 0 ? (
            <section className="space-y-2">
              <SectionHeader title="หมวดที่ยังค้าง" />
              <div className="space-y-2">
                {blockers.map((b) => (
                  <Link
                    key={b.topic.id}
                    href={b.topic.href}
                    className="kl-section flex min-h-[2.75rem] items-center justify-between gap-3 kl-pressable"
                  >
                    <span className="kl-type-body">
                      {b.topic.title} · เหลือ {b.remaining}
                    </span>
                    <ChevronRight
                      className={KL_ICON_CLASS}
                      strokeWidth={KL_ICON_STROKE}
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <SectionHeader title="รายการเตรียมเปิดร้าน" />
            <p className="kl-type-helper">
              กดหมวดเพื่อดูและอัปเดตรายการ
            </p>
            <div className="space-y-2">
              {topics.map((row) => (
                <Link
                  key={row.topic.id}
                  href={row.topic.href}
                  className="kl-section flex min-h-[3rem] items-center justify-between gap-3 kl-pressable"
                >
                  <div className="min-w-0">
                    <p className="kl-type-body font-medium">{row.topic.title}</p>
                    <p className="kl-type-caption mt-0.5">
                      {row.isExternal
                        ? "เปิดหน้าจัดการ"
                        : row.total === 0
                          ? "ยังไม่มีรายการ"
                          : `พร้อม ${row.ready}/${row.total} · เหลือ ${row.remaining}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!row.isExternal && row.total > 0 ? (
                      <span className="kl-type-caption tabular-nums">
                        {row.percent}%
                      </span>
                    ) : null}
                    <ChevronRight
                      className={KL_ICON_CLASS}
                      strokeWidth={KL_ICON_STROKE}
                      aria-hidden
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <ButtonLink href="/opening/checklist" fullWidth>
            ไปรายการเตรียมเปิดร้าน
          </ButtonLink>
        </>
      ) : null}
    </AppShell>
  );
}
