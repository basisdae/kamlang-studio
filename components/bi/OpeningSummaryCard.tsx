"use client";

import SummaryCard from "./SummaryCard";
import SummaryMetric from "./SummaryMetric";
import type { OpeningSummary } from "../../app/opening/lib/openingDomain";

type Props = {
  summary: OpeningSummary;
  /** compact = 3 metrics only; full adds inventory totals */
  variant?: "compact" | "full";
  title?: string;
};

/**
 * Outcome of Opening Checklist — never a second dataset.
 * พร้อมแล้ว % · เหลือกี่รายการ · ต้องใช้งบอีกเท่าไร
 */
export default function OpeningSummaryCard({
  summary,
  variant = "compact",
  title = "สรุปเปิดร้าน",
}: Props) {
  return (
    <SummaryCard title={title}>
      <div className="grid grid-cols-3 gap-2">
        <SummaryMetric label="พร้อมแล้ว" value={`${summary.readyPercent}%`} />
        <SummaryMetric
          label="เหลืออีก"
          value={`${summary.remainingCount}`}
          tone={summary.remainingCount > 0 ? "accent" : "success"}
        />
        <SummaryMetric
          label="ต้องใช้งบอีก"
          amount={summary.moneyNeeded}
          tone="accent"
        />
      </div>
      <div className="kl-progress-track mt-3">
        <div
          className="kl-progress-fill"
          style={{ width: `${summary.readyPercent}%` }}
        />
      </div>
      <p className="kl-type-caption mt-2">
        พร้อม {summary.readyCount}/{summary.totalCount} รายการ
      </p>
      {summary.noPriceCount > 0 ? (
        <div className="mt-2">
          <SummaryMetric
            label="ยังไม่มีราคา"
            value={`${summary.noPriceCount} รายการ`}
            warning
            align="start"
          />
        </div>
      ) : null}
      {variant === "full" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SummaryMetric
            label="มูลค่ารวม"
            amount={summary.inventoryTotal}
            tone="primary"
          />
          <SummaryMetric
            label="มีแล้ว"
            amount={summary.inventoryOwned}
            tone="success"
          />
          <SummaryMetric
            label="ยังต้องจัดหา"
            amount={summary.moneyNeeded}
            tone="accent"
          />
          <SummaryMetric
            label="ซื้อจริง"
            amount={summary.inventoryActualSpend}
            tone={
              summary.inventoryActualSpend > 0 ? "success" : "muted"
            }
          />
        </div>
      ) : null}
    </SummaryCard>
  );
}
