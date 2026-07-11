"use client";

import { useMemo, useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import BudgetItemCard from "../../../components/bi/BudgetItemCard";
import BiConnectionBanner from "../../../components/bi/BiConnectionBanner";
import BiListSkeleton from "../../../components/bi/BiListSkeleton";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import PageHeader from "../../../components/bi/PageHeader";
import NextStepCard from "../../../components/bi/NextStepCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import EmptyState from "../../../components/ui/EmptyState";
import ButtonLink from "../../../components/ui/ButtonLink";
import Card from "../../../components/ui/Card";
import { getDecisionGroupBudgetViews } from "../../../data/seed/assetBudget";
import {
  formatBaht,
  getBudgetMoneyNeeded,
  getBudgetReadyPercent,
  getBudgetTodayDecision,
  getBudgetUnknownPriceCount,
  getPriorityBreakdown,
  sortBudgetItemsByDecision,
  STATUS_LABELS,
  STATUS_WORKFLOW_ORDER,
  type BudgetStatus,
} from "../sampleData";
import { useAssets } from "../assets/AssetsProvider";
import { useBudget } from "../../providers/BudgetProvider";
import { useWorkspace } from "../../providers/WorkspaceProvider";

type ContentFilter = "all" | BudgetStatus;

/**
 * Budget decision page — live bi_budget_items + bi_assets + decision groups
 */
export default function OpeningBudgetPage() {
  const { workspaceName, dataSource } = useWorkspace();
  const {
    assets,
    decisionGroups,
    ready: assetsReady,
  } = useAssets();
  const {
    items,
    summary: liveSummary,
    loading,
    online,
    configured,
    browserOffline,
    error,
    retry,
    ready,
  } = useBudget();
  const [filter, setFilter] = useState<ContentFilter>("all");

  const showSkeleton = loading && !ready;
  const blockOnError = Boolean(error) && items.length === 0;

  const readyPercent =
    liveSummary?.readyPercent ?? getBudgetReadyPercent(items);
  const breakdown = liveSummary
    ? {
        must: { ready: liveSummary.mustReady, total: liveSummary.mustTotal },
        should: {
          ready: liveSummary.shouldReady,
          total: liveSummary.shouldTotal,
        },
        nice: { ready: liveSummary.niceReady, total: liveSummary.niceTotal },
      }
    : getPriorityBreakdown(items);
  const moneyAll = liveSummary?.moneyNeededAll ?? getBudgetMoneyNeeded(items);
  const moneyMust =
    liveSummary?.moneyNeededMust ??
    getBudgetMoneyNeeded(items, { mustOnly: true });
  const unknownAll =
    liveSummary?.unknownPriceAll ?? getBudgetUnknownPriceCount(items);
  const unknownMust =
    liveSummary?.unknownPriceMust ??
    getBudgetUnknownPriceCount(items, { mustOnly: true });
  const todayDecision = getBudgetTodayDecision(items);
  const posViews = useMemo(
    () => getDecisionGroupBudgetViews(assets, decisionGroups),
    [assets, decisionGroups]
  );

  const rangeMin = liveSummary?.minimumBudget ?? 0;
  const rangeMax = liveSummary?.maximumBudget ?? 0;
  const uncertain = liveSummary?.uncertainBudget ?? 0;
  const decisionHints = liveSummary?.decisionHints ?? [];

  const sorted = sortBudgetItemsByDecision(items);
  const filtered =
    filter === "all"
      ? sorted
      : sorted.filter((item) => item.status === filter);

  const todayDecideText = todayDecision
    ? todayDecision.status === "no_price"
      ? `หาราคา “${todayDecision.name}”`
      : todayDecision.status === "comparing"
        ? `เลือกผู้ขาย “${todayDecision.name}”`
        : `สั่งซื้อ “${todayDecision.name}”`
    : "ไม่มีรายการค้างตัดสินใจ";

  const todayDoText = todayDecision
    ? todayDecision.status === "no_price"
      ? "โทรถามราคา หรือขอใบเสนอราคาวันนี้"
      : todayDecision.status === "comparing"
        ? "เปรียบเทียบราคาแล้วตัดสินใจให้จบวันนี้"
        : "ยืนยันออเดอร์และนัดรับของ"
    : "ตรวจรายการตรวจสอบก่อนเปิดร้าน";

  const showEmpty =
    ready && !loading && !error && online && items.length === 0;

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="แผนเปิดร้าน"
        workspace={workspaceName}
        subtitle="งบประมาณ"
      />
      <DataSourceBadge source={dataSource} />
      <p className="kl-type-caption -mt-1">
        แหล่งข้อมูล:{" "}
        {online
          ? "Supabase · bi_budget_items + bi_assets"
          : "แคช / ยังไม่ออนไลน์"}
        {loading ? " · กำลังโหลด..." : ""}
      </p>

      {showSkeleton ? (
        <BiListSkeleton rows={4} />
      ) : (
        <BiConnectionBanner
          configured={configured}
          online={online}
          browserOffline={browserOffline}
          error={error}
          empty={showEmpty}
          emptyTitle="ยังไม่มีรายการงบ"
          emptyHint="ตรวจ seed ใน Supabase หรือกดลองใหม่"
          onRetry={() => void retry()}
        />
      )}

      {!showSkeleton && !blockOnError && (online || items.length > 0) ? (
        <>
          <SummaryCard title="วันนี้ต้องรู้ 4 ข้อ">
            <div className="space-y-4">
              <div>
                <p className="kl-type-label">1. Readiness Score</p>
                <p className="kl-type-metric-lg mt-1">{readyPercent}%</p>
                <div className="kl-progress-track mt-2">
                  <div
                    className="kl-progress-fill"
                    style={{ width: `${readyPercent}%` }}
                  />
                </div>
                <p className="kl-type-helper mt-2">
                  นับ Must Have ที่ได้รับแล้ว / ติดตั้งแล้ว
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <PriorityCount
                    label="Must"
                    ready={breakdown.must.ready}
                    total={breakdown.must.total}
                  />
                  <PriorityCount
                    label="Should"
                    ready={breakdown.should.ready}
                    total={breakdown.should.total}
                  />
                  <PriorityCount
                    label="Nice"
                    ready={breakdown.nice.ready}
                    total={breakdown.nice.total}
                  />
                </div>
              </div>

              <div>
                <p className="kl-type-label">2. ต้องเตรียมเงินอีกเท่าไร</p>
                <div className="mt-2 space-y-3">
                  <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface p-3">
                    <p className="kl-type-caption">ซื้อทั้งหมด</p>
                    <p className="kl-type-metric mt-1">{formatBaht(moneyAll)}</p>
                    <p className="kl-type-helper mt-1">
                      {unknownAll > 0
                        ? `ยังมี ${unknownAll} รายการไม่มีราคา`
                        : "ครบราคาประเมินแล้ว"}
                    </p>
                  </div>
                  <div className="rounded-[var(--kl-radius-inner)] border border-[var(--bi-lemon)] bg-[rgb(231_246_91/0.22)] p-3">
                    <p className="kl-type-caption font-medium text-[var(--bi-text-primary)]">
                      ซื้อเฉพาะ Must Have
                    </p>
                    <p className="kl-type-metric mt-1">{formatBaht(moneyMust)}</p>
                    <p className="kl-type-helper mt-1">
                      {unknownMust > 0
                        ? `Must ยังมี ${unknownMust} รายการไม่มีราคา`
                        : "งบเปิดร้านขั้นต่ำ"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="kl-type-label">3. วันนี้ต้องตัดสินใจอะไร</p>
                <p className="kl-type-card-title mt-1">{todayDecideText}</p>
              </div>

              <div>
                <p className="kl-type-label">4. วันนี้ควรทำอะไร</p>
                <p className="kl-type-card-title mt-1">{todayDoText}</p>
              </div>
            </div>
          </SummaryCard>

          {assetsReady ? (
            <SummaryCard title="งบประเมิน · ใช้จริง · ช่วงตัดสินใจ">
              <div className="grid grid-cols-2 gap-2">
                <Metric
                  label="งบประเมินรวม (ต่ำสุด)"
                  value={formatBaht(rangeMin)}
                />
                <Metric
                  label="งบประเมินรวม (สูงสุด)"
                  value={formatBaht(rangeMax)}
                />
                <Metric
                  label="ยังไม่แน่นอน"
                  value={formatBaht(uncertain)}
                />
                <Metric
                  label="Must Have ค้างซื้อ"
                  value={formatBaht(moneyMust)}
                />
              </div>
              <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface p-3">
                <p className="kl-type-caption">ช่วงต่ำสุด–สูงสุด</p>
                <p className="kl-type-metric mt-1">
                  {formatBaht(rangeMin)} – {formatBaht(rangeMax)}
                </p>
                <p className="kl-type-helper mt-1">
                  รวมกฎ POS: ไม่บวกรุ่นคู่ขนาน · ยังไม่เลือก = 12,500–16,800
                </p>
              </div>
              {decisionHints.map((hint) => (
                <Card
                  key={hint}
                  className="!p-3 border border-[var(--bi-lemon)]"
                >
                  <p className="kl-type-body">{hint}</p>
                </Card>
              ))}
              {posViews.map((view) => (
                <div
                  key={view.group.id}
                  className="rounded-[var(--kl-radius-inner)] bg-kl-surface p-3 space-y-1"
                >
                  <p className="kl-type-caption font-medium">
                    {view.group.name} · เลือกได้ 1 ตัว
                  </p>
                  <p className="kl-type-helper">
                    {view.undecided
                      ? "ยังไม่ตัดสินใจ"
                      : `เลือกแล้ว: ${view.selected?.name}`}
                  </p>
                  <p className="kl-type-body">
                    {formatBaht(view.minAmount)} – {formatBaht(view.maxAmount)}
                  </p>
                  {view.undecided && view.savingsIfCheapest > 0 ? (
                    <p className="kl-type-caption">
                      เลือก Mini ลดงบ{" "}
                      {view.savingsIfCheapest.toLocaleString("th-TH")} บาท
                    </p>
                  ) : null}
                  <ul className="space-y-1 pt-1">
                    {view.options.map((opt) => (
                      <li key={opt.id}>
                        <a
                          href={`/opening/assets/${opt.id}`}
                          className="kl-type-caption text-[var(--bi-text-primary)] underline"
                        >
                          {opt.name} ·{" "}
                          {opt.estimatedPrice != null
                            ? formatBaht(opt.estimatedPrice)
                            : "—"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <ButtonLink href="/opening/assets" fullWidth>
                ไปรายการทรัพย์สิน
              </ButtonLink>
            </SummaryCard>
          ) : null}

          <NextStepCard
            message={
              todayDecision
                ? `${todayDoText} — “${todayDecision.name}”`
                : todayDoText
            }
            href={
              todayDecision
                ? todayDecision.status === "ready_to_buy"
                  ? "/opening/assets"
                  : todayDecision.assetId
                    ? `/opening/assets/${todayDecision.assetId}`
                    : "/opening/budget"
                : "/opening/checklist"
            }
            actionLabel={
              todayDecision
                ? todayDecision.status === "no_price"
                  ? "เริ่มจากรายการนี้"
                  : todayDecision.status === "comparing"
                    ? "ดูรายการเปรียบเทียบ"
                    : "ไปทรัพย์สิน"
                : "ไปรายการตรวจสอบ"
            }
          />

          <section className="space-y-3">
            <SectionHeader title="รายการตาม Priority" />
            <p className="kl-type-helper">
              เรียง Must → Should → Nice · จาก bi_budget_items · กดการ์ดไป Asset
              Detail
            </p>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <FilterChip
                active={filter === "all"}
                label="ทั้งหมด"
                onClick={() => setFilter("all")}
              />
              {STATUS_WORKFLOW_ORDER.map((status) => (
                <FilterChip
                  key={status}
                  active={filter === status}
                  label={STATUS_LABELS[status]}
                  onClick={() => setFilter(status)}
                />
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="ไม่มีรายการในขั้นนี้"
                hint="ลองเปลี่ยน workflow หรือดูทั้งหมด"
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <BudgetItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      <ButtonLink href="/opening" fullWidth>
        กลับแผนเปิดร้าน
      </ButtonLink>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}

function PriorityCount({
  label,
  ready,
  total,
}: {
  label: string;
  ready: number;
  total: number;
}) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {ready}/{total}
      </p>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`kl-segment-btn shrink-0 whitespace-nowrap kl-pressable ${
        active
          ? "bg-[var(--bi-lemon)] text-[var(--bi-text-primary)]"
          : "bg-kl-surface text-kl-muted"
      }`}
    >
      {label}
    </button>
  );
}
