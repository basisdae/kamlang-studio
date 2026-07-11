import AppShell from "../../../components/layout/AppShell";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import NextStepCard from "../../../components/bi/NextStepCard";
import OpeningCalendarTaskCard from "../../../components/bi/OpeningCalendarTaskCard";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import ButtonLink from "../../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import {
  getCalendarSummary,
  sortCalendarTasks,
  WORKSPACE_NAME,
} from "./sampleData";

/**
 * Opening Timeline / Calendar — path to Soft & Grand Opening.
 * Vertical card timeline · no tables.
 * Pattern: Header → Summary → Next Action → Content → Primary Action
 */
export default function OpeningCalendarPage() {
  const tasks = sortCalendarTasks();
  const summary = getCalendarSummary();
  const next = summary.next;

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="แผนเปิดร้าน"
        workspace={WORKSPACE_NAME}
        subtitle="Opening Timeline"
      />
      <p className="kl-type-helper -mt-1">
        เส้นทางเปิดร้านตั้งเตา · วัน · Task · Deadline
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <SummaryCard title="ก่อนวันเปิด">
        <div className="grid grid-cols-4 gap-2">
          <Metric label="ทั้งหมด" value={`${summary.total}`} />
          <Metric label="เสร็จ" value={`${summary.done}`} />
          <Metric label="กำลังทำ" value={`${summary.inProgress}`} />
          <Metric label="ถัดไป" value={`${summary.upcoming}`} />
        </div>
      </SummaryCard>

      <NextStepCard
        message={
          next
            ? `ถัดไป: “${next.task}” · Deadline ${next.deadlineLabel} · ${next.owner}`
            : "งานเปิดร้านครบแล้ว"
        }
        href={
          next?.task.includes("POS")
            ? "/opening/assets"
            : next?.task.includes("ป้าย")
              ? "/opening/budget"
              : "/opening/checklist"
        }
        actionLabel="ไปทำต่อ"
      />

      <section>
        <SectionHeader title="Timeline เปิดร้าน" />
        <p className="kl-type-helper mb-3 mt-1">
          เรียงตามวัน · Card · Vertical
        </p>
        <div className="pt-1">
          {tasks.map((task, index) => (
            <OpeningCalendarTaskCard
              key={task.id}
              task={task}
              isLast={index === tasks.length - 1}
            />
          ))}
        </div>
      </section>

      <ButtonLink href="/opening/checklist" fullWidth>
        ไปรายการตรวจสอบ
      </ButtonLink>
      <ButtonLink href="/opening" variant="secondary" fullWidth>
        กลับแผนเปิดร้าน
      </ButtonLink>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-1.5 py-2 text-center">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}
