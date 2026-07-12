"use client";

import SummaryCard from "./SummaryCard";
import SummaryMetric from "./SummaryMetric";
import { formatBaht } from "../../app/opening/sampleData";
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
        <SummaryMetric label="เหลืออีก" value={`${summary.remainingCount}`} />
        <SummaryMetric
          label="ต้องใช้งบอีก"
          value={formatBaht(summary.moneyNeeded)}
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
        {summary.noPriceCount > 0
          ? ` · งบยังไม่ครบ เพราะมี ${summary.noPriceCount} รายการที่ยังไม่มีราคา`
          : ""}
      </p>
      {variant === "full" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SummaryMetric
            label="มูลค่ารวม"
            value={formatBaht(summary.inventoryTotal)}
          />
          <SummaryMetric
            label="มีแล้ว"
            value={formatBaht(summary.inventoryOwned)}
          />
          <SummaryMetric
            label="ยังต้องจัดหา"
            value={formatBaht(summary.moneyNeeded)}
          />
          <SummaryMetric
            label="ซื้อจริง"
            value={formatBaht(summary.inventoryActualSpend)}
          />
        </div>
      ) : null}
    </SummaryCard>
  );
}
