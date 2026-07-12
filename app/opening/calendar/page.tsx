"use client";

import { useMemo, useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import BiListSkeleton from "../../../components/bi/BiListSkeleton";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import NextStepCard from "../../../components/bi/NextStepCard";
import OpeningCalendarTaskCard from "../../../components/bi/OpeningCalendarTaskCard";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import SummaryMetric from "../../../components/bi/SummaryMetric";
import ButtonLink from "../../../components/ui/ButtonLink";
import EmptyState from "../../../components/ui/EmptyState";
import SearchBar from "../../../components/ui/SearchBar";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import { matchesTextSearch } from "../lib/listPolish";
import {
  getCalendarSummary,
  sortCalendarTasks,
  WORKSPACE_NAME,
  type OpeningCalendarTask,
} from "./sampleData";

type SortKey = "name" | "status" | "created";

/**
 * Opening Timeline / Calendar — path to Soft & Grand Opening.
 * Vertical card timeline · no tables.
 */
export default function OpeningCalendarPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("created");
  const [ready] = useState(true);

  const allTasks = useMemo(() => sortCalendarTasks(), []);
  const summary = useMemo(() => getCalendarSummary(allTasks), [allTasks]);
  const next = summary.next;

  const tasks = useMemo(() => {
    const filtered = allTasks.filter((t) =>
      matchesTextSearch([t.task, t.owner, t.deadlineLabel, t.dayLabel], query)
    );
    const nextRows = [...filtered];
    nextRows.sort((a, b) => compareTasks(a, b, sort));
    return nextRows;
  }, [allTasks, query, sort]);

  if (!ready) {
    return (
      <AppShell title="" hidePageHeader compact backHref="/opening">
        <BiListSkeleton rows={4} />
      </AppShell>
    );
  }

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
          <SummaryMetric
            label="ทั้งหมด"
            value={`${summary.total}`}
            className="!px-1.5"
          />
          <SummaryMetric
            label="เสร็จ"
            value={`${summary.done}`}
            className="!px-1.5"
          />
          <SummaryMetric
            label="กำลังทำ"
            value={`${summary.inProgress}`}
            className="!px-1.5"
          />
          <SummaryMetric
            label="ถัดไป"
            value={`${summary.upcoming}`}
            className="!px-1.5"
          />
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

      <section className="space-y-3">
        <SectionHeader title="Timeline เปิดร้าน" />
        <SearchBar
          placeholder="ชื่องาน หมายเหตุ Owner..."
          value={query}
          onChange={setQuery}
        />
        <label className="flex min-h-[2.75rem] items-center gap-2 rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3">
          <span className="kl-type-caption shrink-0 text-kl-muted">เรียง</span>
          <select
            className="min-w-0 flex-1 bg-transparent outline-none"
            value={sort}
            aria-label="เรียงรายการ"
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="name">ชื่อ</option>
            <option value="status">สถานะ</option>
            <option value="created">วันที่</option>
          </select>
        </label>

        {allTasks.length === 0 ? (
          <EmptyState
            title="ยังไม่มีรายการ"
            hint="ยังไม่มีงานในไทม์ไลน์เปิดร้าน"
            actionLabel="+ เพิ่มรายการ"
            actionHref="/opening/checklist"
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="ไม่พบรายการ"
            hint="ลองเปลี่ยนคำค้น"
            actionLabel="ไปรายการเตรียมเปิดร้าน"
            actionHref="/opening/checklist"
          />
        ) : (
          <div className="pt-1">
            {tasks.map((task, index) => (
              <OpeningCalendarTaskCard
                key={task.id}
                task={task}
                isLast={index === tasks.length - 1}
              />
            ))}
          </div>
        )}
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

function compareTasks(
  a: OpeningCalendarTask,
  b: OpeningCalendarTask,
  sort: SortKey
) {
  if (sort === "name") return a.task.localeCompare(b.task, "th");
  if (sort === "status") return a.status.localeCompare(b.status);
  return new Date(a.day).getTime() - new Date(b.day).getTime();
}
