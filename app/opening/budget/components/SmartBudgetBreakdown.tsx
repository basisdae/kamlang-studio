"use client";

import Card from "../../../../components/ui/Card";
import SectionHeader from "../../../../components/bi/SectionHeader";
import { formatBaht } from "../../sampleData";
import type { SmartBudgetBucketRow } from "../../lib/smartBudget";

type Props = {
  buckets: SmartBudgetBucketRow[];
};

export default function SmartBudgetBreakdown({ buckets }: Props) {
  const max = Math.max(...buckets.map((b) => b.estimated), 1);

  return (
    <section className="space-y-3">
      <SectionHeader title="Budget Breakdown" />
      <p className="kl-type-helper -mt-1">
        แยกตามหมวดจากรายการเตรียมเปิดร้าน
      </p>
      <div className="space-y-2">
        {buckets.map((b) => (
          <Card key={b.id} className="space-y-2 !p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="kl-type-card-title">{b.label}</p>
                <p className="kl-type-caption mt-0.5">
                  {b.count} รายการ
                  {b.noPrice > 0 ? ` · ไม่มีราคา ${b.noPrice}` : ""}
                </p>
              </div>
              <p className="kl-type-body shrink-0 tabular-nums">
                {formatBaht(b.estimated)}
              </p>
            </div>
            <div className="kl-progress-track">
              <div
                className="kl-progress-fill"
                style={{
                  width: `${Math.min(100, (b.estimated / max) * 100)}%`,
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Mini label="ประเมิน" value={formatBaht(b.estimated)} />
              <Mini label="จริง" value={formatBaht(b.actual)} />
              <Mini label="ค้างจัดหา" value={formatBaht(b.need)} />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 text-center">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-caption mt-0.5 tabular-nums break-all">{value}</p>
    </div>
  );
}
