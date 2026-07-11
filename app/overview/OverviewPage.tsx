import Link from "next/link";
import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import PageHeader from "../../components/bi/PageHeader";
import MetricCard from "../../components/bi/MetricCard";
import NextStepCard from "../../components/bi/NextStepCard";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import ButtonLink from "../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import {
  APP_TAGLINE,
  formatBaht,
  getChecklistProgress,
  getPrimaryOpeningNextStep,
  OPENING_SUMMARY,
  WORKSPACE_NAME,
} from "../opening/sampleData";

const progressPercent = Math.round(
  (OPENING_SUMMARY.estimatedBudget / OPENING_SUMMARY.targetBudget) * 100
);

const remainingBudget =
  OPENING_SUMMARY.targetBudget - OPENING_SUMMARY.estimatedBudget;

/**
 * Sprint 1 page pattern (locked):
 * Page Header → Summary → Next Action → Content → Primary Action
 */
export default function OverviewPage() {
  const next = getPrimaryOpeningNextStep();
  const checklist = getChecklistProgress();

  return (
    <AppShell title="" hidePageHeader compact>
      {/* 1. Page Header */}
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        tagline={APP_TAGLINE}
        subtitle="ภาพรวมการเตรียมเปิดร้าน"
      />
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      {/* 2. Summary */}
      <SummaryCard title="สรุปงบประมาณ">
        <div className="space-y-1">
          <p className="kl-type-label">งบที่กำลังวางแผน</p>
          <Link href="/opening/budget" className="block kl-pressable">
            <p className="kl-type-metric-lg">
              {formatBaht(OPENING_SUMMARY.targetBudget)}
            </p>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="kl-type-label">ประเมินแล้ว</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {formatBaht(OPENING_SUMMARY.estimatedBudget)}
            </p>
          </div>
          <div>
            <p className="kl-type-label">ยังเหลือในกรอบ</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {formatBaht(remainingBudget)}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="kl-type-label">ความคืบหน้าการประเมิน</p>
            <p className="kl-type-caption">{progressPercent}%</p>
          </div>
          <div
            className="kl-progress-track"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="kl-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </SummaryCard>

      {/* 3. Next Action */}
      <NextStepCard
        message={next.message}
        href={next.href}
        actionLabel={next.actionLabel}
      />

      {/* 4. Content */}
      <section className="space-y-3">
        <SectionHeader title="สถานะเปิดร้าน" />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="รอราคา"
            value={OPENING_SUMMARY.waitingPriceCount}
            hint="รายการ"
            href="/opening/budget"
          />
          <MetricCard
            label="รายการตรวจสอบ"
            value={`${checklist.done}/${checklist.total}`}
            hint={`เหลือ ${checklist.remaining}`}
            href="/opening/checklist"
          />
          <MetricCard
            label="ซื้อแล้ว"
            value={OPENING_SUMMARY.purchasedCount}
            hint="รายการ"
            href="/opening/budget"
          />
          <MetricCard
            label="ทีมบริหาร"
            value={OPENING_SUMMARY.teamCount}
            hint="คน"
            href="/opening/team"
          />
        </div>
      </section>

      {/* 5. Primary Action */}
      <ButtonLink href="/opening" fullWidth>
        เปิดแผนเปิดร้าน
      </ButtonLink>
    </AppShell>
  );
}
