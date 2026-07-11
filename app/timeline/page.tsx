import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import NextStepCard from "../../components/bi/NextStepCard";
import PageHeader from "../../components/bi/PageHeader";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import TimelineEventCard from "../../components/bi/TimelineEventCard";
import ButtonLink from "../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import {
  getTimelineSummary,
  groupTimelineByDay,
  WORKSPACE_NAME,
} from "./sampleData";

/**
 * Sprint 2 — Business Timeline
 * Story of the business, not an activity log.
 * Pattern: Header → Summary → Next Action → Content → Primary Action
 */
export default function TimelinePage() {
  const groups = groupTimelineByDay();
  const summary = getTimelineSummary();
  const latest = summary.latest;

  return (
    <AppShell title="" hidePageHeader compact>
      {/* 1. Page Header */}
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        subtitle="Timeline"
      />
      <p className="kl-type-helper -mt-1">
        เส้นทางธุรกิจ — ไม่ใช่ Activity Log
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      {/* 2. Summary */}
      <SummaryCard title="ร้านกำลังเดินไปไหน">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="วันนี้" value={`${summary.todayCount}`} />
          <Metric label="ทั้งหมด" value={`${summary.eventCount}`} />
          <Metric label="ทีม" value={`${summary.peopleCount}`} />
        </div>
        {latest ? (
          <div>
            <p className="kl-type-label">ล่าสุด</p>
            <p className="kl-type-body mt-1">
              {latest.action} · {latest.item} · {latest.person}
            </p>
          </div>
        ) : null}
      </SummaryCard>

      {/* 3. Next Action */}
      <NextStepCard
        message={
          latest
            ? `ต่อจาก “${latest.action}” — เปิดรายการที่เกี่ยวข้อง`
            : "เริ่มบันทึกเส้นทางธุรกิจ"
        }
        href={latest?.href ?? "/opening"}
        actionLabel="ดูรายการนี้"
      />

      {/* 4. Content — grouped by day */}
      <section className="space-y-5">
        <SectionHeader title="Timeline ตามวัน" />

        {groups.map((group) => (
          <div key={group.dateKey} className="space-y-3">
            <h3 className="kl-type-label px-0.5">{group.label}</h3>
            <div className="space-y-2.5">
              {group.events.map((event) => (
                <TimelineEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 5. Primary Action */}
      <ButtonLink href="/opening" fullWidth>
        ไปแผนเปิดร้าน
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
