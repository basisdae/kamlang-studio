"use client";

import SummaryCard from "../../../../components/bi/SummaryCard";
import SummaryMetric from "../../../../components/bi/SummaryMetric";
import { formatBaht } from "../../sampleData";
import type { SmartBudgetReport } from "../../lib/smartBudget";

type Props = {
  report: SmartBudgetReport;
};

export default function SmartBudgetVarianceCard({ report }: Props) {
  const over = report.difference > 0;
  const under = report.difference < 0;

  return (
    <SummaryCard title="Estimated vs Actual">
      <div className="grid grid-cols-2 gap-2">
        <SummaryMetric
          label="ประเมิน (Estimated)"
          amount={report.estimatedTotal}
          tone="primary"
        />
        <SummaryMetric
          label="ซื้อจริง (Actual)"
          amount={report.actualTotal}
          tone={report.actualTotal > 0 ? "success" : "muted"}
        />
        <SummaryMetric
          label="ส่วนต่าง (Difference)"
          value={`${report.difference > 0 ? "+" : report.difference < 0 ? "−" : ""}${Math.abs(report.difference).toLocaleString("th-TH")} บาท`}
          tone={
            report.difference > 0
              ? "accent"
              : report.difference < 0
                ? "success"
                : "muted"
          }
        />
        <SummaryMetric
          label="Variance"
          value={
            report.variancePct == null
              ? "—"
              : `${report.variancePct > 0 ? "+" : ""}${report.variancePct}%`
          }
          tone={
            report.variancePct == null
              ? "muted"
              : report.variancePct > 0
                ? "accent"
                : "neutral"
          }
        />
      </div>
      <p className="kl-type-helper">
        {report.estimatedTotal === 0
          ? "ยังไม่มีราคาประเมินใน Checklist"
          : over
            ? "จ่ายจริงสูงกว่าประเมิน — ตรวจรายการที่ราคาพุ่ง"
            : under
              ? "จ่ายจริงต่ำกว่าประเมิน — งบประเมินยังเผื่ออยู่"
              : "จ่ายจริงตรงกับประเมิน"}
      </p>
      <p className="kl-type-caption">
        ยังต้องจัดหา {formatBaht(report.needTotal)}
      </p>
      {report.unknownPriceCount > 0 ? (
        <SummaryMetric
          label="ยังไม่มีราคา"
          value={`${report.unknownPriceCount} รายการ`}
          warning
          align="start"
        />
      ) : null}
    </SummaryCard>
  );
}
