"use client";

import SummaryCard from "../../../../components/bi/SummaryCard";
import type { DailyActivitySummary } from "../../lib/workspaceActivity";
import { ACTION_LABELS } from "../../lib/workspaceActivity";

type Props = {
  days: DailyActivitySummary[];
};

export default function ActivityDailySummary({ days }: Props) {
  const today = days[0];
  if (!today) {
    return (
      <SummaryCard title="Daily Summary">
        <p className="kl-type-helper">ยังไม่มีกิจกรรมให้สรุป</p>
      </SummaryCard>
    );
  }

  const actionLine = Object.entries(today.actions)
    .map(([k, n]) => `${ACTION_LABELS[k] ?? k} ${n}`)
    .join(" · ");

  return (
    <SummaryCard title="Daily Summary">
      <p className="kl-type-card-title">{today.dayLabel}</p>
      <p className="kl-type-metric mt-1">{today.count} รายการ</p>
      <p className="kl-type-helper mt-2">
        โดย {today.actors.length ? today.actors.join(", ") : "—"}
      </p>
      {actionLine ? (
        <p className="kl-type-caption mt-1">{actionLine}</p>
      ) : null}
      {days.length > 1 ? (
        <p className="kl-type-caption mt-2">
          ประวัติย้อนหลัง {days.length} วันในฟีดด้านล่าง
        </p>
      ) : null}
    </SummaryCard>
  );
}
