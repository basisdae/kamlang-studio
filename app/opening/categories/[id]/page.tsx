import { notFound } from "next/navigation";
import AppShell from "../../../../components/layout/AppShell";
import DataSourceBadge from "../../../../components/bi/DataSourceBadge";
import MetricCard from "../../../../components/bi/MetricCard";
import NextStepCard from "../../../../components/bi/NextStepCard";
import ProgressCard from "../../../../components/bi/ProgressCard";
import SectionHeader from "../../../../components/bi/SectionHeader";
import ButtonLink from "../../../../components/ui/ButtonLink";
import BudgetItemCard from "../../../../components/bi/BudgetItemCard";
import { OPENING_DATA_SOURCE } from "../../../../components/bi/dataSource";
import {
  formatBaht,
  OPENING_BUDGET_ITEMS,
  OPENING_CATEGORIES,
} from "../../sampleData";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OpeningCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = OPENING_CATEGORIES.find((item) => item.id === id);

  if (!category) {
    notFound();
  }

  const related = OPENING_BUDGET_ITEMS.filter(
    (item) => item.category === category.name
  );
  const needsPrice = related.filter(
    (item) => item.status === "no_price" || item.status === "comparing"
  );

  return (
    <AppShell title={category.name} backHref="/opening" compact>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      {/* 1. ภาพรวม */}
      <section className="space-y-3">
        <SectionHeader title="ภาพรวม" />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="จำนวนรายการ" value={category.itemCount} />
          <MetricCard
            label="ยอดประเมิน"
            value={formatBaht(category.estimatedTotal)}
            href="/opening/budget"
          />
          <MetricCard
            label="ยังไม่ทราบราคา"
            value={category.unknownPriceCount}
          />
        </div>
      </section>

      {/* 2. สิ่งที่ควรทำต่อ */}
      <NextStepCard
        message={
          needsPrice[0]
            ? `ควรหา quote “${needsPrice[0].name}” ในหมวดนี้`
            : category.unknownPriceCount > 0
              ? `ยังมี ${category.unknownPriceCount} รายการไม่มีราคา — เปิดงบประมาณเพื่อเคลียร์`
              : "หมวดนี้เคลียร์ราคาแล้ว — กลับแผนเปิดร้านทำหมวดถัดไป"
        }
        href="/opening/budget"
        actionLabel="ไปงบประมาณ"
      />

      {/* 3. รายละเอียด */}
      <ProgressCard
        label="ความคืบหน้า"
        percent={category.progress}
        detail="Sample Data — พร้อมต่อยอดเป็น logic จริง"
      />

      <section className="space-y-3">
        <SectionHeader title="รายละเอียด" />
        {related.length > 0 ? (
          related.map((item) => (
            <BudgetItemCard key={item.id} item={item} />
          ))
        ) : (
          <p className="kl-type-helper">
            ยังไม่มีรายการงบที่ผูกกับหมวดนี้โดยตรง
          </p>
        )}
      </section>

      {/* 4. Action */}
      <section className="space-y-3">
        <SectionHeader title="Action" />
        <ButtonLink href="/opening/budget" fullWidth>
          ดูงบประมาณทั้งหมด
        </ButtonLink>
        <ButtonLink href="/opening" variant="secondary" fullWidth>
          กลับแผนเปิดร้าน
        </ButtonLink>
      </section>
    </AppShell>
  );
}
