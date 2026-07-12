"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "../../../components/layout/AppShell";
import BiDataStatus from "../../../components/bi/BiDataStatus";
import BiListSkeleton from "../../../components/bi/BiListSkeleton";
import NextStepCard from "../../../components/bi/NextStepCard";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import ButtonLink from "../../../components/ui/ButtonLink";
import EmptyState from "../../../components/ui/EmptyState";
import SearchBar from "../../../components/ui/SearchBar";
import SegmentChip from "../../../components/ui/SegmentChip";
import { useWorkspace } from "../../providers/WorkspaceProvider";
import { useAssets } from "../assets/AssetsProvider";
import { matchesAssetSearch } from "../lib/listPolish";
import {
  buildProcurementSummary,
  filterByProcurementStage,
  PROCUREMENT_STAGE_LABELS,
  type ProcurementStageFilter,
} from "../lib/procurementDomain";
import { formatBaht } from "../sampleData";
import ProcurementItemCard from "./components/ProcurementItemCard";
import ProcurementSummaryCard from "./components/ProcurementSummaryCard";

const STAGE_CHIPS: { id: ProcurementStageFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "request_quote", label: PROCUREMENT_STAGE_LABELS.request_quote },
  { id: "compare", label: PROCUREMENT_STAGE_LABELS.compare },
  { id: "ready_to_order", label: PROCUREMENT_STAGE_LABELS.ready_to_order },
  { id: "outstanding", label: PROCUREMENT_STAGE_LABELS.outstanding },
  { id: "received", label: PROCUREMENT_STAGE_LABELS.received },
];

function parseStage(raw: string | null): ProcurementStageFilter {
  if (
    raw === "request_quote" ||
    raw === "compare" ||
    raw === "ready_to_order" ||
    raw === "outstanding" ||
    raw === "received"
  ) {
    return raw;
  }
  return "all";
}

function OpeningProcurementInner() {
  const searchParams = useSearchParams();
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

  const [stage, setStage] = useState<ProcurementStageFilter>(() =>
    parseStage(searchParams.get("stage"))
  );
  const [query, setQuery] = useState("");

  useEffect(() => {
    setStage(parseStage(searchParams.get("stage")));
  }, [searchParams]);

  const summary = useMemo(() => buildProcurementSummary(assets), [assets]);
  const rows = useMemo(() => {
    return filterByProcurementStage(assets, stage).filter((a) =>
      matchesAssetSearch(a, query)
    );
  }, [assets, stage, query]);

  const nextStage: ProcurementStageFilter | null =
    summary.outstanding > 0
      ? "outstanding"
      : summary.requestQuote > 0
        ? "request_quote"
        : summary.compare > 0
          ? "compare"
          : summary.readyToOrder > 0
            ? "ready_to_order"
            : null;

  const focusMessage =
    summary.outstanding > 0
      ? `มีของค้างรับ ${summary.outstanding} รายการ · ${formatBaht(summary.outstandingSpend)}`
      : summary.requestQuote > 0
        ? `ขอราคา ${summary.requestQuote} รายการที่ยังไม่มีผู้ขาย`
        : summary.compare > 0
          ? `เปรียบเทียบราคา ${summary.compare} รายการ`
          : summary.readyToOrder > 0
            ? `พร้อมสั่ง ${summary.readyToOrder} รายการ`
            : "ไม่มีรายการจัดหาค้าง — กลับไปดู Checklist";

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="เปิดร้าน"
        workspace={workspaceName}
        subtitle="จัดหา / สั่งซื้อ"
      />
      <p className="kl-type-helper -mt-1">
        จากรายการต้องจัดหา · ข้อมูลชุดเดียวกับ Checklist
      </p>

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={ready && !loading && !error && online && assets.length === 0}
        hasCachedData={false}
        emptyTitle="ยังไม่มีรายการ"
        emptyHint="เพิ่มรายการใน Checklist ก่อน แล้วค่อยจัดหา"
        emptyActionLabel="+ เพิ่มรายการ"
        emptyActionHref="/opening/assets/new"
        sourceHint={
          online
            ? "แหล่งข้อมูล: bi_assets · จัดหา"
            : "แหล่งข้อมูล: โหลดไม่สำเร็จ"
        }
        skeletonRows={4}
        onRetry={() => void retry()}
      />

      {!loading && !error ? (
        <div className="min-w-0 space-y-3">
          <ProcurementSummaryCard summary={summary} />

          <NextStepCard
            message={focusMessage}
            href={
              nextStage
                ? `/opening/procurement?stage=${nextStage}`
                : "/opening/checklist"
            }
            actionLabel={nextStage ? "ไปทำต่อ" : "ไปรายการเตรียมเปิดร้าน"}
          />

          <section className="space-y-3">
            <SectionHeader title="รายการจัดหา" />
            <SearchBar
              placeholder="ชื่อ หมายเหตุ Supplier..."
              value={query}
              onChange={setQuery}
            />
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {STAGE_CHIPS.map((chip) => (
                <SegmentChip
                  key={chip.id}
                  label={
                    chip.id !== "all"
                      ? `${chip.label} (${
                          chip.id === "request_quote"
                            ? summary.requestQuote
                            : chip.id === "compare"
                              ? summary.compare
                              : chip.id === "ready_to_order"
                                ? summary.readyToOrder
                                : chip.id === "outstanding"
                                  ? summary.outstanding
                                  : summary.received
                        })`
                      : chip.label
                  }
                  active={stage === chip.id}
                  onClick={() => setStage(chip.id)}
                />
              ))}
            </div>

            {rows.length === 0 ? (
              <EmptyState
                title="ยังไม่มีรายการในขั้นตอนนี้"
                hint="ลองเปลี่ยนตัวกรอง หรือไปเพิ่มใน Checklist"
                actionLabel="ไปรายการเตรียมเปิดร้าน"
                actionHref="/opening/checklist"
              />
            ) : (
              <div className="space-y-3">
                {rows.map((item) => (
                  <ProcurementItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <ButtonLink href="/opening/checklist" variant="secondary" fullWidth>
            กลับรายการเตรียมเปิดร้าน
          </ButtonLink>
        </div>
      ) : null}
    </AppShell>
  );
}

export default function OpeningProcurementPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="" hidePageHeader compact backHref="/opening">
          <BiListSkeleton rows={4} />
        </AppShell>
      }
    >
      <OpeningProcurementInner />
    </Suspense>
  );
}
