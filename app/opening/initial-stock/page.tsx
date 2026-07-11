import AppShell from "../../../components/layout/AppShell";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import InitialStockCard from "../../../components/bi/InitialStockCard";
import MetricCard from "../../../components/bi/MetricCard";
import NextStepCard from "../../../components/bi/NextStepCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import ButtonLink from "../../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import {
  formatBaht,
  getInitialStockTotal,
  OPENING_INITIAL_STOCK,
} from "../sampleData";

export default function OpeningInitialStockPage() {
  const total = getInitialStockTotal();
  const missingCost = OPENING_INITIAL_STOCK.filter(
    (item) => item.estimatedCost == null
  );

  return (
    <AppShell title="วัตถุดิบเริ่มต้น" backHref="/opening" compact>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      {/* 1. ภาพรวม */}
      <section className="space-y-3">
        <SectionHeader title="ภาพรวม" />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="รายการ"
            value={OPENING_INITIAL_STOCK.length}
          />
          <MetricCard
            label="ประมาณการรวม"
            value={formatBaht(total)}
            href="/opening/budget"
          />
        </div>
      </section>

      {/* 2. สิ่งที่ควรทำต่อ */}
      <NextStepCard
        message={
          missingCost.length > 0
            ? "ยังมีวัตถุดิบที่ไม่มีราคา — ใส่ประมาณการก่อนสั่งซื้อ"
            : "สต็อกเปิดร้านพร้อมประมาณการแล้ว — ตรวจรายการตรวจสอบต่อ"
        }
        href={
          missingCost.length > 0 ? "/opening/budget" : "/opening/checklist"
        }
        actionLabel={
          missingCost.length > 0 ? "ดูในงบประมาณ" : "ไปรายการตรวจสอบ"
        }
      />

      {/* 3. รายละเอียด */}
      <section className="space-y-3">
        <SectionHeader title="รายละเอียด" />
        <div className="space-y-3">
          {OPENING_INITIAL_STOCK.map((item) => (
            <InitialStockCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* 4. Action */}
      <section className="space-y-3">
        <SectionHeader title="Action" />
        <ButtonLink href="/opening/budget" fullWidth>
          ดูงบวัตถุดิบ
        </ButtonLink>
        <ButtonLink href="/opening/team" variant="secondary" fullWidth>
          ไปทีมบริหาร
        </ButtonLink>
      </section>
    </AppShell>
  );
}
