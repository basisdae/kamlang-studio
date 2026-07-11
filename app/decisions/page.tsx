import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import DecisionCard from "../../components/bi/DecisionCard";
import NextStepCard from "../../components/bi/NextStepCard";
import PageHeader from "../../components/bi/PageHeader";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import ButtonLink from "../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import {
  getDecisionsSummary,
  sortDecisionQueue,
  WORKSPACE_NAME,
} from "./sampleData";

/**
 * Decision Queue — วันนี้ต้องตัดสินใจอะไร
 * Not a calendar · Card queue by Priority + Deadline
 * Pattern: Header → Summary → Next Action → Content → Primary Action
 */
export default function DecisionsPage() {
  const queue = sortDecisionQueue();
  const summary = getDecisionsSummary();
  const next = summary.next;

  return (
    <AppShell title="" hidePageHeader compact>
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        subtitle="Decisions"
      />
      <p className="kl-type-helper -mt-1">
        Decision Queue · วันนี้ต้องตัดสินใจอะไร
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <SummaryCard title="คิวตัดสินใจวันนี้">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="ทั้งหมด" value={`${summary.total}`} />
          <Metric label="วันนี้" value={`${summary.todayCount}`} />
          <Metric label="Must" value={`${summary.mustCount}`} />
        </div>
        {next ? (
          <div>
            <p className="kl-type-label">อันดับแรกในคิว</p>
            <p className="kl-type-body mt-1">
              {next.title} · {next.deadlineLabel}
            </p>
          </div>
        ) : null}
      </SummaryCard>

      <NextStepCard
        message={
          next
            ? `วันนี้ควรตัดสินใจ “${next.title}” ก่อน — ${next.action}`
            : "ไม่มีรายการค้างตัดสินใจ"
        }
        href={next?.href ?? "/opening"}
        actionLabel="เริ่มจากรายการนี้"
      />

      <section className="space-y-3">
        <SectionHeader title="Decision Queue" />
        <p className="kl-type-helper">
          เรียง Must → Should · Deadline ใกล้ก่อน · ไม่ใช่ Calendar
        </p>
        <div className="space-y-3">
          {queue.map((decision, index) => (
            <DecisionCard
              key={decision.id}
              decision={decision}
              highlight={index === 0}
            />
          ))}
        </div>
      </section>

      <ButtonLink href="/opening/budget" fullWidth>
        ไปงบประมาณ
      </ButtonLink>
      <ButtonLink href="/" variant="secondary" fullWidth>
        กลับภาพรวม
      </ButtonLink>
    </AppShell>
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
