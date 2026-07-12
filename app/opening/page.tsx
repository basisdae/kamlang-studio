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
import ButtonLink from "../../components/ui/ButtonLink";
import WorkspaceLandingHeader from "../../components/workspaces/WorkspaceLandingHeader";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { useAssets } from "./assets/AssetsProvider";
import {
  buildOpeningSummary,
  nextOpeningFocus,
  previewChecklistItems,
} from "./lib/openingDomain";

/**
 * Opening Hub — Context (Switcher) once, then Content title ภาพรวม.
 */
export default function OpeningHubPage() {
  const {
    workspaceId,
    configured,
    browserOffline,
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

  const loading = assetsLoading;
  const ready = assetsReady;
  const online = assetsOnline;
  const error = assetsError;
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

  const showStatusPanel =
    !configured ||
    browserOffline ||
    Boolean(error) ||
    (isEmpty && !loading);

  return (
    <AppShell title="" hidePageHeader compact>
      <WorkspaceLandingHeader
        title="ภาพรวม"
        description="รายการเตรียม · งบประมาณ · พร้อมเปิด"
      />

      {showStatusPanel ? (
        <BiDataStatus
          loading={false}
          ready={ready}
          configured={configured}
          online={online}
          browserOffline={browserOffline}
          error={error}
          empty={isEmpty && !loading}
          hasCachedData={false}
          emptyTitle="ยังไม่มีรายการ"
          emptyHint="เริ่มเพิ่มรายการแรกได้เลย"
          emptyActionLabel="+ เพิ่มรายการ"
          emptyActionHref="/opening/assets/new"
          sourceHint={error ? "โหลดไม่สำเร็จ — กดลองใหม่" : undefined}
          skeleton={false}
          onRetry={() => void retry()}
        />
      ) : null}

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
