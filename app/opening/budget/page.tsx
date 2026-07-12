"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../../../components/layout/AppShell";
import BudgetItemCard from "../../../components/bi/BudgetItemCard";
import BiDataStatus from "../../../components/bi/BiDataStatus";
import PageHeader from "../../../components/bi/PageHeader";
import NextStepCard from "../../../components/bi/NextStepCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import EmptyState from "../../../components/ui/EmptyState";
import SearchBar from "../../../components/ui/SearchBar";
import ButtonLink from "../../../components/ui/ButtonLink";
import Card from "../../../components/ui/Card";
import ListSortSelect from "../../../components/bi/ListSortSelect";
import SummaryMetric from "../../../components/bi/SummaryMetric";
import SegmentChip from "../../../components/ui/SegmentChip";
import { getDecisionGroupBudgetViews } from "../../../data/seed/assetBudget";
import { ASSET_STATUS_FLOW, type AssetItem } from "../../../data/seed/tangtao";
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
import {
  type InventoryLine,
} from "../../../lib/services/inventoryRollup";
import OpeningSummaryCard from "../../../components/bi/OpeningSummaryCard";
import { buildOpeningSummary, openingAssetsOnly } from "../lib/openingDomain";
import {
  matchesTextSearch,
  type ListSortKey,
} from "../lib/listPolish";
import { buildSmartBudget } from "../lib/smartBudget";
import { useModuleViewConfig } from "../../../lib/workspaces/moduleViewConfig";
import { PLATFORM_LANDING_PATH } from "../../../lib/workspaces/appWorkspaces";
import SmartBudgetBreakdown from "./components/SmartBudgetBreakdown";
import SmartBudgetExportButton from "./components/SmartBudgetExportButton";
import SmartBudgetVarianceCard from "./components/SmartBudgetVarianceCard";
import SmartBudgetWaterfall from "./components/SmartBudgetWaterfall";

type ContentFilter = "all" | BudgetStatus;
type DrillTab = "all" | "owned" | "need" | "no_price";

/**
 * Budget Platform Module — same route for every Workspace.
 * View angle comes from ModuleViewConfig.summaryMode (opening | finance).
 */
export default function OpeningBudgetPage() {
  const { workspaceName } = useWorkspace();
  const view = useModuleViewConfig("opening-budget");
  const financeView = view.summaryMode === "finance";
  const backHref = financeView ? PLATFORM_LANDING_PATH : "/opening";
  const {
    assets,
    decisionGroups,
    ready: assetsReady,
    loading: assetsLoading,
    online: assetsOnline,
    error: assetsError,
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
  const [drill, setDrill] = useState<DrillTab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ListSortKey>("name");

  useEffect(() => {
    if (view.defaultFilter === "need") setDrill("need");
    else if (!financeView) setDrill("all");
  }, [view.defaultFilter, financeView]);

  const openingSummary = useMemo(() => buildOpeningSummary(assets), [assets]);
  const smartBudget = useMemo(
    () => buildSmartBudget(openingAssetsOnly(assets)),
    [assets]
  );
  const inventory = openingSummary.buckets;
  const assetsById = useMemo(() => {
    const map = new Map<string, AssetItem>();
    for (const a of assets) map.set(a.id, a);
    return map;
  }, [assets]);

  const statusOrder = useMemo(
    () => new Map(ASSET_STATUS_FLOW.map((s, i) => [s, i] as const)),
    []
  );

  const showSkeleton = assetsLoading && !assetsReady;
  const blockOnError =
    Boolean(assetsError) && assets.length === 0 && !showSkeleton;
  /** Smart Budget SSoT = bi_assets — do not AND budget provider online */
  const pageOnline = assetsOnline;
  const pageError = assetsError;

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
    assetsReady &&
    !assetsLoading &&
    !pageError &&
    pageOnline &&
    assets.length === 0;

  const sourceHint =
    pageError
      ? "โหลดไม่สำเร็จ — กดลองใหม่"
      : showSkeleton
        ? "กำลังโหลด…"
        : undefined;

  const allLines = useMemo(() => {
    const map = new Map<string, InventoryLine>();
    for (const row of [
      ...inventory.owned,
      ...inventory.need,
      ...inventory.noPrice,
      ...inventory.allPriced,
    ]) {
      map.set(row.id, row);
    }
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "th")
    );
  }, [inventory]);

  const visibleDrill = useMemo(() => {
    let rows: InventoryLine[];
    if (drill === "owned") rows = inventory.owned;
    else if (drill === "need") rows = inventory.need;
    else if (drill === "no_price") rows = inventory.noPrice;
    else rows = allLines;

    rows = rows.filter((row) => {
      const asset = assetsById.get(row.id);
      return matchesTextSearch(
        [row.name, row.category, asset?.note, asset?.supplier],
        query
      );
    });

    const next = [...rows];
    next.sort((a, b) => {
      switch (sort) {
        case "status": {
          const sa = statusOrder.get(a.status) ?? 99;
          const sb = statusOrder.get(b.status) ?? 99;
          if (sa !== sb) return sa - sb;
          return a.name.localeCompare(b.name, "th");
        }
        case "price": {
          const pa = a.lineTotal ?? -1;
          const pb = b.lineTotal ?? -1;
          if (pa !== pb) return pb - pa;
          return a.name.localeCompare(b.name, "th");
        }
        case "created": {
          const ca = assetsById.get(a.id)?.createdAt ?? "";
          const cb = assetsById.get(b.id)?.createdAt ?? "";
          if (ca !== cb) return cb.localeCompare(ca);
          return a.name.localeCompare(b.name, "th");
        }
        case "name":
        default:
          return a.name.localeCompare(b.name, "th");
      }
    });
    return next;
  }, [allLines, drill, inventory, query, sort, assetsById, statusOrder]);

  return (
    <AppShell title="" hidePageHeader compact backHref={backHref}>
      <PageHeader
        title={financeView ? "งบประมาณ" : "เปิดร้าน"}
        workspace={workspaceName}
        subtitle={financeView ? "มุมเงินจากรายการจริง" : "งบประมาณ"}
      />
      <p className="kl-type-helper -mt-1">
        {financeView
          ? "Budget Module · โฟกัสมูลค่า จัดหา และรายการที่ยังไม่มีราคา"
          : "ผลลัพธ์จากรายการเตรียมเปิดร้าน · ไม่ใช้เงินลงทุนเป็นฐาน"}
      </p>

      <BiDataStatus
        loading={assetsLoading}
        ready={assetsReady}
        configured={configured}
        online={pageOnline}
        browserOffline={browserOffline}
        error={pageError}
        empty={showEmpty}
        hasCachedData={false}
        emptyTitle="ยังไม่มีรายการ"
        emptyHint="เริ่มเพิ่มรายการแรกได้เลย"
        emptyActionLabel="+ เพิ่มรายการ"
        emptyActionHref="/opening/assets/new"
        sourceHint={sourceHint}
        skeletonRows={4}
        onRetry={() => void retry()}
      />

      {!showSkeleton && !blockOnError && pageOnline ? (
        <>
          {!financeView ? (
            <OpeningSummaryCard summary={openingSummary} variant="full" />
          ) : null}

          <SmartBudgetWaterfall report={smartBudget} />
          <SmartBudgetVarianceCard report={smartBudget} />
          <SmartBudgetBreakdown buckets={smartBudget.buckets} />
          <SmartBudgetExportButton
            report={smartBudget}
            workspaceName={workspaceName}
          />

          <SummaryCard
            title={financeView ? "สรุปเงิน" : "งบจากรายการจริง"}
          >
            <div className="grid grid-cols-2 gap-2">
              <SummaryMetric
                label="มูลค่ารวมทั้งหมด"
                amount={inventory.inventoryTotal}
                tone="primary"
                align="start"
              />
              <SummaryMetric
                label="มูลค่าของที่มีแล้ว"
                amount={inventory.inventoryOwned}
                tone="success"
                align="start"
              />
              <SummaryMetric
                label="งบที่ยังต้องจัดหา"
                amount={inventory.inventoryNeed}
                tone="accent"
                align="start"
              />
              <SummaryMetric
                label="ประเมินรวม (Checklist)"
                amount={smartBudget.estimatedTotal}
                tone="primary"
                align="start"
              />
            </div>
            {inventory.countNoPrice > 0 ? (
              <SummaryMetric
                label="ยังไม่มีราคา"
                value={`${inventory.countNoPrice} รายการ`}
                warning
                align="start"
              />
            ) : null}
            <p className="kl-type-caption">
              {inventory.countAll} รายการ · มีแล้ว {inventory.countOwned} ·
              ต้องจัดหา {inventory.countNeed} · ไม่มีราคา{" "}
              {inventory.countNoPrice}
            </p>
          </SummaryCard>

          <section className="space-y-3">
            <SectionHeader title="ดูรายละเอียดงบ" />
            <SearchBar
              placeholder="ชื่อ หมายเหตุ Supplier..."
              value={query}
              onChange={setQuery}
            />
            <ListSortSelect value={sort} onChange={setSort} />
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {(
                [
                  ["all", `รายการทั้งหมด (${inventory.countAll})`],
                  ["owned", `ของที่มีแล้ว (${inventory.countOwned})`],
                  ["need", `ยังต้องจัดหา (${inventory.countNeed})`],
                  ["no_price", `ไม่มีราคา (${inventory.countNoPrice})`],
                ] as const
              ).map(([key, label]) => (
                <SegmentChip
                  key={key}
                  active={drill === key}
                  label={label}
                  onClick={() => setDrill(key)}
                />
              ))}
            </div>
            {assets.length === 0 ? (
              <EmptyState
                title="ยังไม่มีรายการ"
                hint="เริ่มเพิ่มรายการแรกได้เลย"
                actionLabel="+ เพิ่มรายการ"
                actionHref="/opening/assets/new"
              />
            ) : visibleDrill.length === 0 ? (
              <EmptyState
                title="ไม่พบรายการ"
                hint="ลองเปลี่ยนคำค้นหรือกลุ่ม"
                actionLabel="+ เพิ่มรายการ"
                actionHref="/opening/assets/new"
              />
            ) : (
              <Card className="!overflow-hidden !p-0">
                {visibleDrill.map((row) => (
                  <InventoryDrillRow key={row.id} row={row} />
                ))}
              </Card>
            )}
          </section>

          <SummaryCard
            title={financeView ? "ต้องรู้ตอนนี้" : "วันนี้ต้องรู้ 4 ข้อ"}
          >
            <div className="space-y-4">
              {!financeView ? (
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
                  <SummaryMetric
                    label="Must"
                    value={`${breakdown.must.ready}/${breakdown.must.total}`}
                  />
                  <SummaryMetric
                    label="Should"
                    value={`${breakdown.should.ready}/${breakdown.should.total}`}
                  />
                  <SummaryMetric
                    label="Nice"
                    value={`${breakdown.nice.ready}/${breakdown.nice.total}`}
                  />
                </div>
              </div>
              ) : null}

              <div>
                <p className="kl-type-label">
                  {financeView ? "1. ต้องเตรียมเงินอีกเท่าไร" : "2. ต้องเตรียมเงินอีกเท่าไร"}
                </p>
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
                <p className="kl-type-label">
                  {financeView ? "2. วันนี้ต้องตัดสินใจอะไร" : "3. วันนี้ต้องตัดสินใจอะไร"}
                </p>
                <p className="kl-type-card-title mt-1">{todayDecideText}</p>
              </div>

              <div>
                <p className="kl-type-label">
                  {financeView ? "3. วันนี้ควรทำอะไร" : "4. วันนี้ควรทำอะไร"}
                </p>
                <p className="kl-type-card-title mt-1">{todayDoText}</p>
              </div>
            </div>
          </SummaryCard>

          {assetsReady ? (
            <SummaryCard title="งบประเมิน · ใช้จริง · ช่วงตัดสินใจ">
              <div className="grid grid-cols-2 gap-2">
                <SummaryMetric
                  label="งบประเมินรวม (ต่ำสุด)"
                  value={formatBaht(rangeMin)}
                  align="start"
                />
                <SummaryMetric
                  label="งบประเมินรวม (สูงสุด)"
                  value={formatBaht(rangeMax)}
                  align="start"
                />
                <SummaryMetric
                  label="ยังไม่แน่นอน"
                  value={formatBaht(uncertain)}
                  align="start"
                />
                <SummaryMetric
                  label="Must Have ค้างซื้อ"
                  value={formatBaht(moneyMust)}
                  align="start"
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
              <SegmentChip
                active={filter === "all"}
                label="ทั้งหมด"
                onClick={() => setFilter("all")}
              />
              {STATUS_WORKFLOW_ORDER.map((status) => (
                <SegmentChip
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

function InventoryDrillRow({ row }: { row: InventoryLine }) {
  const noPrice = row.unitPrice == null;
  return (
    <div className="flex min-h-[2.75rem] items-start gap-3 border-b border-[var(--kl-border)] px-3 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="kl-type-card-title truncate">{row.name}</p>
          {noPrice ? (
            <span className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-0.5 kl-type-caption">
              ยังไม่ใส่ราคา
            </span>
          ) : null}
        </div>
        <p className="kl-type-helper mt-0.5">
          {row.quantity} {row.unit}
          {noPrice
            ? " · —"
            : ` · ${formatBaht(row.unitPrice!)} / หน่วย`}
        </p>
        <p className="kl-type-caption mt-0.5">{row.statusLabel}</p>
      </div>
      <div className="shrink-0 text-right space-y-1">
        <p className="kl-type-body tabular-nums">
          {noPrice ? "ยังไม่ใส่ราคา" : formatBaht(row.lineTotal!)}
        </p>
        {noPrice ? (
          <Link
            href={`/opening/assets/${row.id}/edit`}
            className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline"
          >
            ใส่ราคา
          </Link>
        ) : (
          <Link
            href={`/opening/assets/${row.id}`}
            className="kl-type-caption text-[var(--bi-text-primary)] underline"
          >
            ดู
          </Link>
        )}
      </div>
    </div>
  );
}
