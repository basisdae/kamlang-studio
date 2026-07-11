"use client";

import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, Plus, RefreshCw } from "lucide-react";
import AppShell from "../../../components/layout/AppShell";
import BiDataStatus from "../../../components/bi/BiDataStatus";
import BiListSkeleton from "../../../components/bi/BiListSkeleton";
import NextStepCard from "../../../components/bi/NextStepCard";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import SearchBar from "../../../components/ui/SearchBar";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import {
  ASSET_CATEGORIES,
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_LABELS,
  type AssetPriority,
  type AssetStatus,
} from "../../../data/seed/tangtao";
import { formatBaht } from "../sampleData";
import { useWorkspace } from "../../providers/WorkspaceProvider";
import { getAssetsSummary, isAssetOwned, useAssets } from "./AssetsProvider";
import AssetCompactRow from "./components/AssetCompactRow";
import AssetListCard from "./components/AssetListCard";

type ViewMode = "card" | "list";
type FilterAll = "all";
type OwnFilter = FilterAll | "owned" | "need_buy" | "no_price";

/**
 * Assets hub — trial-ready checklist surface
 */
function OpeningAssetsInner() {
  const searchParams = useSearchParams();
  const shotEmpty = searchParams.get("shot") === "empty";
  const { workspaceName } = useWorkspace();
  const {
    assets,
    ready,
    loading,
    online,
    configured,
    browserOffline,
    error,
    warning,
    storageError,
    canImportLocal,
    dismissStorageError,
    retry,
    importLocalToSupabase,
    saving,
  } = useAssets();
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    return window.localStorage.getItem("bi.assets.view") === "card"
      ? "card"
      : "list";
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FilterAll | string>("all");
  const [status, setStatus] = useState<FilterAll | AssetStatus>("all");
  const [priority, setPriority] = useState<FilterAll | AssetPriority>("all");
  const [ownFilter, setOwnFilter] = useState<OwnFilter>("all");

  function setViewPersist(next: ViewMode) {
    setView(next);
    try {
      window.localStorage.setItem("bi.assets.view", next);
    } catch {
      /* preference only */
    }
  }

  const showSkeleton = loading && !ready;
  const blockOnError = Boolean(error) && assets.length === 0 && !showSkeleton;
  const sourceHint = showSkeleton
    ? "กำลังดึง bi_assets..."
    : online
      ? "แหล่งข้อมูล: Supabase · bi_assets"
      : error
        ? "แหล่งข้อมูล: โหลดไม่สำเร็จ"
        : assets.length > 0
          ? "แหล่งข้อมูล: แคชสำรอง"
          : "แหล่งข้อมูล: ยังไม่มีข้อมูล";

  const displayAssets = useMemo(
    () => (shotEmpty ? [] : assets),
    [shotEmpty, assets]
  );
  const summary = useMemo(
    () => getAssetsSummary(displayAssets),
    [displayAssets]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayAssets.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (status !== "all" && item.status !== status) return false;
      if (priority !== "all" && item.priority !== priority) return false;
      if (ownFilter === "owned" && !isAssetOwned(item.status)) return false;
      if (ownFilter === "need_buy" && isAssetOwned(item.status)) return false;
      if (
        ownFilter === "no_price" &&
        !(item.estimatedPrice == null && item.actualPrice == null)
      ) {
        return false;
      }
      if (!q) return true;
      const hay =
        `${item.name} ${item.brand} ${item.model} ${item.supplier} ${item.category}`.toLowerCase();
      return hay.includes(q);
    });
  }, [displayAssets, query, category, status, priority, ownFilter]);

  const focus = filtered.find(
    (a) =>
      a.status === "planned" ||
      a.status === "awaiting_quote" ||
      (a.estimatedPrice == null && a.actualPrice == null)
  );

  const hasActiveFilter =
    Boolean(query.trim()) ||
    category !== "all" ||
    status !== "all" ||
    priority !== "all" ||
    ownFilter !== "all";

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="แผนเปิดร้าน"
        workspace={workspaceName}
        subtitle="ทรัพย์สิน"
      />

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={ready && !loading && !error && online && assets.length === 0}
        hasCachedData={!online && assets.length > 0}
        emptyTitle="ยังไม่มีทรัพย์สิน"
        emptyHint="เพิ่มรายการใหม่ — ข้อมูลจะบันทึกใน Supabase"
        sourceHint={sourceHint}
        skeletonRows={5}
        onRetry={() => void retry()}
      />

      {warning ? (
        <Card className="!p-3.5 border border-[var(--bi-lemon)]">
          <p className="kl-type-helper">{warning}</p>
        </Card>
      ) : null}

      {saving ? (
        <p className="kl-type-caption">กำลังบันทึก...</p>
      ) : null}

      {canImportLocal ? (
        <Card className="space-y-3 !p-4 border border-[var(--bi-lemon)]">
          <p className="kl-type-card-title">พบข้อมูล localStorage เก่า</p>
          <p className="kl-type-helper">
            นำเข้าเข้า Supabase ได้ครั้งเดียว · กดเองเท่านั้น ระบบไม่ import
            ซ้ำอัตโนมัติ
          </p>
          <Button
            fullWidth
            className="min-h-[2.75rem]"
            disabled={saving}
            onClick={() => void importLocalToSupabase()}
          >
            นำเข้าข้อมูลเดิม
          </Button>
        </Card>
      ) : null}

      {storageError === "write_failed" ? (
        <Card className="space-y-3 !p-4">
          <p className="kl-type-card-title">แคชในเครื่องบันทึกไม่สำเร็จ</p>
          <p className="kl-type-helper">
            ข้อมูลหลักอยู่ที่ Supabase แล้ว — แคชใช้สำรองชั่วคราวเท่านั้น
          </p>
          <Button
            fullWidth
            className="min-h-[2.75rem]"
            onClick={dismissStorageError}
          >
            ปิดแจ้งเตือน
          </Button>
        </Card>
      ) : null}

      {!showSkeleton && !blockOnError ? (
        <>
          <SummaryCard title="สรุปทรัพย์สิน">
            <div className="grid grid-cols-2 gap-2">
              <Metric label="รายการทั้งหมด" value={`${summary.total}`} />
              <Metric label="มีแล้ว" value={`${summary.owned}`} />
              <Metric label="ต้องซื้อ" value={`${summary.needBuy}`} />
              <Metric label="ยังไม่มีราคา" value={`${summary.noPrice}`} />
            </div>
            <div>
              <p className="kl-type-label">มูลค่าประเมินรวม</p>
              <p className="kl-type-metric mt-1">
                {formatBaht(summary.totalValue)}
              </p>
            </div>
          </SummaryCard>

          <section className="space-y-2">
            <SectionHeader title="จัดการ" />
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/opening/assets/new"
                className="kl-btn kl-btn-primary flex min-h-[2.75rem] items-center justify-center gap-1 kl-pressable"
              >
                <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
                เพิ่มอุปกรณ์
              </Link>
              <Button
                variant="secondary"
                fullWidth
                className="min-h-[2.75rem]"
                disabled={loading}
                onClick={() => void retry()}
              >
                <RefreshCw
                  className={KL_ICON_CLASS}
                  strokeWidth={KL_ICON_STROKE}
                />
                รีเฟรช
              </Button>
            </div>
          </section>

          <NextStepCard
            message={
              displayAssets.length === 0
                ? "ยังไม่มีรายการ — เพิ่มอุปกรณ์จาก Supabase"
                : focus
                  ? `ยังค้าง “${focus.name}” — ${ASSET_STATUS_LABELS[focus.status]}`
                  : "รายการหลักเคลียร์แล้ว — ตรวจ Must Have ในงบประมาณ"
            }
            href={
              displayAssets.length === 0
                ? "/opening/assets/new"
                : focus
                  ? `/opening/assets/${focus.id}`
                  : "/opening/budget"
            }
            actionLabel={
              displayAssets.length === 0
                ? "เพิ่มอุปกรณ์"
                : focus
                  ? "เปิดรายการ"
                  : "ไปงบประมาณ"
            }
          />

          <section className="space-y-3">
            <SearchBar
              placeholder="ชื่อ ยี่ห้อ รุ่น Supplier หมวด..."
              value={query}
              onChange={setQuery}
            />

            <div className="flex gap-2 overflow-x-auto pb-1">
              <FilterSelect
                label="หมวด"
                value={category}
                onChange={setCategory}
                options={[
                  { value: "all", label: "ทุกหมวด" },
                  ...ASSET_CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
              />
              <FilterSelect
                label="สถานะ"
                value={status}
                onChange={(v) => setStatus(v as FilterAll | AssetStatus)}
                options={[
                  { value: "all", label: "ทุกสถานะ" },
                  ...(
                    Object.entries(ASSET_STATUS_LABELS) as [
                      AssetStatus,
                      string,
                    ][]
                  ).map(([value, label]) => ({ value, label })),
                ]}
              />
              <FilterSelect
                label="Priority"
                value={priority}
                onChange={(v) => setPriority(v as FilterAll | AssetPriority)}
                options={[
                  { value: "all", label: "ทุก Priority" },
                  ...(
                    Object.entries(ASSET_PRIORITY_LABELS) as [
                      AssetPriority,
                      string,
                    ][]
                  ).map(([value, label]) => ({ value, label })),
                ]}
              />
              <FilterSelect
                label="มีแล้ว/ต้องซื้อ"
                value={ownFilter}
                onChange={(v) => setOwnFilter(v as OwnFilter)}
                options={[
                  { value: "all", label: "ทั้งหมด" },
                  { value: "owned", label: "มีแล้ว" },
                  { value: "need_buy", label: "ต้องซื้อ" },
                  { value: "no_price", label: "ยังไม่มีราคา" },
                ]}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <SectionHeader
                title={view === "list" ? "แบบรายการ" : "แบบการ์ด"}
              />
              <div className="flex gap-1 rounded-[var(--kl-radius-inner)] bg-kl-surface p-1">
                <ViewToggle
                  active={view === "list"}
                  onClick={() => setViewPersist("list")}
                  label="รายการ"
                  icon={List}
                />
                <ViewToggle
                  active={view === "card"}
                  onClick={() => setViewPersist("card")}
                  label="การ์ด"
                  icon={LayoutGrid}
                />
              </div>
            </div>

            {displayAssets.length === 0 ? (
              <EmptyState
                title="ยังไม่มีรายการอุปกรณ์"
                hint="เริ่มเพิ่มอุปกรณ์ — ข้อมูลจะบันทึกใน Supabase"
                actionLabel="เพิ่มอุปกรณ์"
                actionHref="/opening/assets/new"
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="ค้นหาไม่พบ"
                hint={
                  hasActiveFilter
                    ? "ลองล้างคำค้นหรือตัวกรอง"
                    : "ไม่มีรายการที่ตรงเงื่อนไข"
                }
                actionLabel="ล้างตัวกรอง"
                onAction={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                  setPriority("all");
                  setOwnFilter("all");
                }}
              />
            ) : view === "list" ? (
              <Card className="!overflow-hidden !p-0">
                {filtered.map((item) => (
                  <AssetCompactRow key={item.id} item={item} />
                ))}
              </Card>
            ) : (
              <div className="space-y-3">
                {filtered.map((item) => (
                  <AssetListCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      <div className="h-16" />

      <div className="fixed inset-x-0 bottom-[4.5rem] z-20 px-4 pointer-events-none md:bottom-6">
        <div className="mx-auto max-w-[var(--bi-app-width)] pointer-events-auto">
          <Link
            href="/opening/assets/new"
            className="kl-btn kl-btn-primary flex min-h-[2.75rem] w-full items-center justify-center gap-2 shadow-lg kl-pressable"
          >
            <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
            เพิ่มอุปกรณ์
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

export default function OpeningAssetsPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="ทรัพย์สิน" backHref="/opening" compact>
          <BiListSkeleton rows={4} />
        </AppShell>
      }
    >
      <OpeningAssetsInner />
    </Suspense>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="shrink-0">
      <span className="sr-only">{label}</span>
      <select
        className="kl-segment-btn min-h-[2.75rem] max-w-[10rem] truncate bg-kl-surface text-kl-muted"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof List;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center gap-1 rounded-[var(--kl-radius-inner)] px-2 kl-pressable ${
        active
          ? "bg-[var(--bi-lemon)] text-[var(--bi-text-primary)]"
          : "text-kl-muted"
      }`}
      aria-label={label}
      aria-pressed={active}
    >
      <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
    </button>
  );
}
