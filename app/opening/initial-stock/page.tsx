"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "../../../components/layout/AppShell";
import BiDataStatus from "../../../components/bi/BiDataStatus";
import MetricCard from "../../../components/bi/MetricCard";
import NextStepCard from "../../../components/bi/NextStepCard";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import ButtonLink from "../../../components/ui/ButtonLink";
import Card from "../../../components/ui/Card";
import {
  ASSET_STATUS_LABELS,
  assetHasNoPrice,
  type AssetItem,
} from "../../../data/seed/tangtao";
import { formatBaht } from "../sampleData";
import { useAssets } from "../assets/AssetsProvider";
import { useWorkspace } from "../../providers/WorkspaceProvider";

const STOCK_CATEGORY_ORDER = [
  "ซอสและเครื่องปรุง",
  "เนื้อสัตว์และของแปรรูป",
  "วัตถุดิบเพิ่มเติม",
] as const;

const STOCK_CATEGORIES = new Set<string>(STOCK_CATEGORY_ORDER);

export default function OpeningInitialStockPage() {
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

  const stockItems = useMemo(
    () => assets.filter((a) => STOCK_CATEGORIES.has(a.category)),
    [assets]
  );

  const grouped = useMemo(() => {
    return STOCK_CATEGORY_ORDER.map((category) => ({
      category,
      items: stockItems
        .filter((a) => a.category === category)
        .sort((a, b) => a.name.localeCompare(b.name, "th")),
    })).filter((g) => g.items.length > 0);
  }, [stockItems]);

  const total = stockItems.reduce((sum, item) => {
    const unit = item.estimatedPrice;
    return sum + (unit != null ? unit * item.quantity : 0);
  }, 0);
  const missingCost = stockItems.filter((item) => assetHasNoPrice(item));

  const showSkeleton = loading && !ready;
  const sourceHint = showSkeleton
    ? "กำลังดึง bi_assets..."
    : online
      ? `แหล่งข้อมูล: bi_assets · วัตถุดิบ ${stockItems.length} รายการ`
      : error
        ? "แหล่งข้อมูล: โหลดไม่สำเร็จ"
        : stockItems.length > 0
          ? "แหล่งข้อมูล: แคชสำรอง"
          : "แหล่งข้อมูล: ยังไม่มีข้อมูล";

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="แผนเปิดร้าน"
        workspace={workspaceName}
        subtitle="วัตถุดิบเริ่มต้น"
      />

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={
          ready && !loading && !error && online && stockItems.length === 0
        }
        hasCachedData={!online && stockItems.length > 0}
        emptyTitle="ยังไม่มีวัตถุดิบ"
        emptyHint="เพิ่มรายการในหมวดซอส / เนื้อ / วัตถุดิบเพิ่มเติม"
        sourceHint={sourceHint}
        skeletonRows={3}
        onRetry={() => void retry()}
      />

      {!showSkeleton && !(error && stockItems.length === 0) ? (
        <>
          <section className="space-y-3">
            <SectionHeader title="ภาพรวม" />
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="รายการ" value={stockItems.length} />
              <MetricCard
                label="ประมาณการรวม"
                value={formatBaht(total)}
                href="/opening/budget"
              />
            </div>
            {missingCost.length > 0 ? (
              <p className="kl-type-helper">
                งบประมาณยังไม่ครบ เพราะมี {missingCost.length}{" "}
                รายการที่ยังไม่มีราคา
              </p>
            ) : null}
          </section>

          <NextStepCard
            message={
              missingCost.length > 0
                ? "ยังมีวัตถุดิบที่ไม่มีราคา — ใส่ประมาณการก่อนสั่งซื้อ"
                : "สต็อกเปิดร้านพร้อมประมาณการแล้ว — ตรวจรายการตรวจสอบต่อ"
            }
            href={
              missingCost.length > 0
                ? `/opening/assets/${missingCost[0].id}/edit`
                : "/opening/checklist"
            }
            actionLabel={
              missingCost.length > 0 ? "ใส่ราคา" : "ไปรายการตรวจสอบ"
            }
          />

          <section className="space-y-4">
            {grouped.map((group) => (
              <div key={group.category} className="space-y-3">
                <SectionHeader title={group.category} />
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <StockRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <SectionHeader title="Action" />
            <ButtonLink href="/opening/assets/new" fullWidth>
              เพิ่มวัตถุดิบ
            </ButtonLink>
            <ButtonLink href="/opening/budget" variant="secondary" fullWidth>
              ดูงบวัตถุดิบ
            </ButtonLink>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}

function StockRow({ item }: { item: AssetItem }) {
  const noPrice = assetHasNoPrice(item);
  const unit = item.estimatedPrice;
  const line = unit != null ? unit * item.quantity : null;

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="kl-type-card-title">{item.name}</h3>
            {noPrice ? (
              <span className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-0.5 kl-type-caption">
                ยังไม่ใส่ราคา
              </span>
            ) : null}
          </div>
          <p className="kl-type-caption mt-1">
            {ASSET_STATUS_LABELS[item.status]}
          </p>
        </div>
        <p className="kl-type-body tabular-nums shrink-0">
          {noPrice ? "ยังไม่ใส่ราคา" : formatBaht(line!)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="kl-type-label">จำนวน</p>
          <p className="kl-type-body mt-1">
            {item.quantity.toLocaleString("th-TH")} {item.unit}
          </p>
        </div>
        <div>
          <p className="kl-type-label">ราคาต่อหน่วย</p>
          <p className="kl-type-body mt-1">
            {noPrice ? "—" : formatBaht(unit!)}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/opening/assets/${item.id}`}
          className="kl-type-caption font-medium text-[var(--bi-text-primary)]"
        >
          ดูรายละเอียด →
        </Link>
        {noPrice ? (
          <Link
            href={`/opening/assets/${item.id}/edit`}
            className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline"
          >
            ใส่ราคา
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
