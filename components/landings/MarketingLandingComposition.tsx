"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BiDataStatus from "../bi/BiDataStatus";
import NextStepCard from "../bi/NextStepCard";
import SectionHeader from "../bi/SectionHeader";
import SummaryMetric from "../bi/SummaryMetric";
import WorkspaceLandingHeader from "../workspaces/WorkspaceLandingHeader";
import Button from "../ui/Button";
import ButtonLink from "../ui/ButtonLink";
import Card from "../ui/Card";
import SectionLink from "../ui/SectionLink";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { useWorkspace } from "../../app/providers/WorkspaceProvider";
import { useAssets } from "../../app/opening/assets/AssetsProvider";
import { emptyAssetForm } from "../../app/opening/assets/components/AssetForm";
import {
  MARKETING_STARTER_ITEMS,
  MARKETING_TOPICS,
  buildMarketingSummary,
  defaultCategoryForMarketingTopic,
  marketingTopicProgress,
  nextMarketingFocus,
  previewMarketingChecklistItems,
} from "../../lib/marketing/marketingChecklist";
import { uxStatusLabel } from "../../app/opening/lib/openingDomain";

/**
 * Marketing Landing — Marketing Readiness Composition.
 * Checklist Module (same bi_assets) · Timeline / Documents secondary.
 * No Campaign Module.
 */
export default function MarketingLandingComposition() {
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
    addAsset,
    saving,
  } = useAssets();
  const [seeding, setSeeding] = useState(false);

  const summary = useMemo(() => buildMarketingSummary(assets), [assets]);
  const focus = useMemo(() => nextMarketingFocus(assets), [assets]);
  const preview = useMemo(
    () => previewMarketingChecklistItems(assets, 5),
    [assets]
  );
  const topics = useMemo(
    () => MARKETING_TOPICS.map((t) => marketingTopicProgress(assets, t)),
    [assets]
  );

  const showStatus = !configured || browserOffline || Boolean(error);
  const isEmpty = !loading && !error && summary.totalCount === 0;

  const retry = async () => {
    await retryWs();
    await retryAssets();
  };

  async function applyStarterTemplate() {
    if (seeding || saving) return;
    setSeeding(true);
    try {
      for (const row of MARKETING_STARTER_ITEMS) {
        const base = emptyAssetForm();
        await addAsset({
          ...base,
          name: row.name,
          category: defaultCategoryForMarketingTopic(row.topicId),
          priority: "must",
          status: "planned",
          requiredForOpening: false,
          documentIds: [],
          imageUrl: null,
          purchaseHistory: [],
          repairHistory: [],
          decisionGroupId: null,
        });
      }
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        title="ภาพรวม"
        description="Marketing Readiness · Checklist ก่อนเปิดการตลาด"
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
          <p className="kl-type-helper">กำลังโหลดรายการการตลาด…</p>
        </Card>
      ) : null}

      {!loading && !error ? (
        <>
          <Card className="space-y-3 !p-3">
            <div className="grid grid-cols-2 gap-2">
              <SummaryMetric
                label="Marketing Ready"
                value={`${summary.readyPercent}%`}
                tone={summary.readyPercent >= 100 ? "success" : "accent"}
              />
              <SummaryMetric
                label="Checklist ที่เหลือ"
                value={summary.remainingCount}
                tone={summary.remainingCount > 0 ? "accent" : "success"}
              />
            </div>
            <p className="kl-type-caption">
              พร้อม {summary.readyCount}/{summary.totalCount} รายการ
            </p>
          </Card>

          <NextStepCard
            message={
              isEmpty
                ? "ยังไม่มีรายการ — เริ่มจากหมวดหน้าร้าน หรือเติมรายการแนะนำ"
                : focus.message
            }
            href={isEmpty ? "/opening/checklist/mkt-storefront" : focus.href}
            actionLabel="ไปทำต่อ"
          />

          {isEmpty ? (
            <Button
              fullWidth
              variant="secondary"
              disabled={seeding || saving}
              onClick={() => void applyStarterTemplate()}
            >
              {seeding ? "กำลังเติมรายการ…" : "เติมรายการแนะนำ (ร้านอาหาร)"}
            </Button>
          ) : null}

          <section className="space-y-2">
            <SectionHeader title="หมวด Checklist" />
            <div className="grid grid-cols-2 gap-2">
              {topics.map((row) => (
                <Link
                  key={row.topic.id}
                  href={row.topic.href}
                  className="kl-section block min-w-0 space-y-1 !p-3 kl-pressable"
                >
                  <p className="kl-type-label font-medium">{row.topic.title}</p>
                  <p className="kl-type-caption">
                    {row.total === 0
                      ? "ยังไม่มีรายการ"
                      : `${row.ready}/${row.total} พร้อม`}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {!isEmpty ? (
            <section className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <SectionHeader title="Checklist ล่าสุด" />
                <Link
                  href="/opening/checklist"
                  className="kl-type-caption shrink-0 underline text-[var(--bi-text-primary)]"
                >
                  ดูทั้งหมด
                </Link>
              </div>
              {preview.length === 0 ? (
                <Card className="!p-3">
                  <p className="kl-type-helper">
                    รายการค้างเคลียร์แล้ว — พร้อมตรวจ Timeline / เอกสาร
                  </p>
                </Card>
              ) : (
                <Card className="space-y-0 !p-0 overflow-hidden">
                  {preview.map((item) => (
                    <Link
                      key={item.id}
                      href={`/opening/assets/${item.id}`}
                      className="flex items-center gap-2 border-b border-kl-border px-3 py-2.5 last:border-b-0 kl-pressable"
                    >
                      <span className="min-w-0 flex-1 truncate kl-type-body font-medium">
                        {item.name}
                      </span>
                      <span className="kl-type-caption shrink-0 text-kl-muted">
                        {uxStatusLabel(item.status)}
                      </span>
                      <ChevronRight
                        className={`${KL_ICON_CLASS} shrink-0 text-kl-muted`}
                        strokeWidth={KL_ICON_STROKE}
                        aria-hidden
                      />
                    </Link>
                  ))}
                </Card>
              )}
            </section>
          ) : null}

          <Card className="space-y-1 !p-2">
            <p className="kl-type-caption px-2 pt-1">Module รอง</p>
            <SectionLink variant="nav" href="/timeline" title="Timeline" />
            <SectionLink
              variant="nav"
              href="/opening/documents"
              title="เอกสาร"
            />
          </Card>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <ButtonLink href="/opening/checklist" fullWidth>
              ไปรายการเตรียมการตลาด
            </ButtonLink>
            <ButtonLink href="/timeline" variant="secondary" fullWidth>
              ดู Timeline
            </ButtonLink>
          </div>
        </>
      ) : null}
    </div>
  );
}
