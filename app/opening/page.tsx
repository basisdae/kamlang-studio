"use client";

import { useMemo } from "react";
import AppShell from "../../components/layout/AppShell";
import BiDataStatus from "../../components/bi/BiDataStatus";
import NextStepCard from "../../components/bi/NextStepCard";
import OpeningChecklistPreview from "../../components/bi/OpeningChecklistPreview";
import OpeningHeroCard from "../../components/bi/OpeningHeroCard";
import OpeningHubSkeleton from "../../components/bi/OpeningHubSkeleton";
import OpeningRecentActivity from "../../components/bi/OpeningRecentActivity";
import RecommendationPanel from "../../components/bi/RecommendationPanel";
import PageHeader from "../../components/bi/PageHeader";
import ButtonLink from "../../components/ui/ButtonLink";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { useAssets } from "./assets/AssetsProvider";
import {
  buildOpeningSummary,
  nextOpeningFocus,
  previewChecklistItems,
} from "./lib/openingDomain";

/**
 * Opening Hub = Dashboard
 * Goal: understand shop readiness in ~30 seconds.
 * Checklist = workflow (separate route) · same bi_assets SSoT.
 */
export default function OpeningHubPage() {
  const {
    workspaceName,
    workspaceId,
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
  const preview = useMemo(
    () => previewChecklistItems(assets, 5),
    [assets]
  );

  const loading = wsLoading || assetsLoading;
  const ready = !wsLoading && assetsReady;
  const online = wsOnline && assetsOnline;
  const error = wsError ?? assetsError;
  const isEmpty = ready && !loading && !error && online && assets.length === 0;

  const isShopReady =
    summary.totalCount > 0 &&
    summary.remainingCount === 0 &&
    summary.noPriceCount === 0;

  const verdict = isShopReady
    ? "รายการหลักพร้อมแล้ว — ตรวจทีมและเอกสารครั้งสุดท้าย"
    : assets.length === 0
      ? "ยังไม่มีรายการ — เริ่มเพิ่มสิ่งที่ต้องเตรียม"
      : "ยังไม่พร้อมเปิด — เคลียร์รายการที่ค้างก่อน";

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
        empty={isEmpty}
        hasCachedData={false}
        emptyTitle="ยังไม่มีรายการ"
        emptyHint="เริ่มเพิ่มรายการแรกได้เลย"
        emptyActionLabel="+ เพิ่มรายการ"
        emptyActionHref="/opening/assets/new"
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

      {loading ? <OpeningHubSkeleton /> : null}

      {!loading && !error && !isEmpty ? (
        <div className="min-w-0 space-y-3">
          <OpeningHeroCard
            summary={summary}
            verdict={verdict}
            ctaHref={focus.href}
            ctaLabel="ไปทำต่อ"
          />

          <NextStepCard
            message={focus.message}
            href={focus.href}
            actionLabel="ไปทำต่อ"
          />

          <OpeningChecklistPreview
            items={preview}
            totalRemaining={summary.remainingCount}
          />

          <RecommendationPanel assets={assets} limit={5} />

          <OpeningRecentActivity
            workspaceId={workspaceId}
            enabled={configured && online}
          />

          <ButtonLink href="/opening/procurement" fullWidth>
            ไปจัดหา / สั่งซื้อ
          </ButtonLink>

          <ButtonLink href="/opening/checklist" variant="secondary" fullWidth>
            ไปรายการเตรียมเปิดร้าน
          </ButtonLink>
        </div>
      ) : null}
    </AppShell>
  );
}
