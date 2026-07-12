"use client";

import SummaryCard from "../../../../components/bi/SummaryCard";
import SummaryMetric from "../../../../components/bi/SummaryMetric";
import { formatBaht } from "../../sampleData";
import type { ProcurementSummary } from "../../lib/procurementDomain";

type Props = {
  summary: ProcurementSummary;
};

export default function ProcurementSummaryCard({ summary }: Props) {
  return (
    <SummaryCard title="สรุปการจัดหา">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <SummaryMetric label="ขอราคา" value={`${summary.requestQuote}`} />
        <SummaryMetric label="เปรียบเทียบ" value={`${summary.compare}`} />
        <SummaryMetric label="พร้อมสั่ง" value={`${summary.readyToOrder}`} />
        <SummaryMetric
          label="สั่งแล้ว (ค้างรับ)"
          value={`${summary.outstanding}`}
        />
        <SummaryMetric label="ได้รับแล้ว" value={`${summary.received}`} />
        <SummaryMetric
          label="งบที่ต้องจัดหา"
          value={formatBaht(summary.needSpend)}
        />
        <SummaryMetric
          label="มูลค่าค้างรับ"
          value={formatBaht(summary.outstandingSpend)}
        />
      </div>
      {summary.unknownPrice > 0 ? (
        <p className="kl-type-helper">
          ยังมี {summary.unknownPrice} รายการไม่มีราคา — ขอราคาหรือใส่ราคาประเมิน
        </p>
      ) : null}
    </SummaryCard>
  );
}
