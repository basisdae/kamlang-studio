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
          value={formatBaht(report.estimatedTotal)}
        />
        <SummaryMetric
          label="ซื้อจริง (Actual)"
          value={formatBaht(report.actualTotal)}
        />
        <SummaryMetric
          label="ส่วนต่าง (Difference)"
          value={`${report.difference > 0 ? "+" : ""}${formatBaht(report.difference)}`}
        />
        <SummaryMetric
          label="Variance"
          value={
            report.variancePct == null
              ? "—"
              : `${report.variancePct > 0 ? "+" : ""}${report.variancePct}%`
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
        {report.unknownPriceCount > 0
          ? ` · ไม่มีราคา ${report.unknownPriceCount} รายการ`
          : ""}
      </p>
    </SummaryCard>
  );
}
