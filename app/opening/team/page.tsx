import AppShell from "../../../components/layout/AppShell";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import MetricCard from "../../../components/bi/MetricCard";
import NextStepCard from "../../../components/bi/NextStepCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import Card from "../../../components/ui/Card";
import ButtonLink from "../../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import { formatBaht, OPENING_SUMMARY, OPENING_TEAM } from "../sampleData";

export default function OpeningTeamPage() {
  const totalPercent = OPENING_TEAM.reduce((sum, m) => sum + m.percent, 0);
  const totalAmount = OPENING_TEAM.reduce((sum, m) => sum + m.amount, 0);
  const balanced = totalPercent === 100;
  const gap = OPENING_SUMMARY.targetBudget - totalAmount;

  return (
    <AppShell title="ทีมบริหาร" backHref="/opening" compact>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <section className="space-y-3">
        <SectionHeader title="ภาพรวม" />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="สมาชิก" value={OPENING_TEAM.length} hint="คน" />
          <MetricCard label="รวมสัดส่วน" value={`${totalPercent}%`} />
          <MetricCard label="รวมเงิน" value={formatBaht(totalAmount)} />
          <MetricCard
            label="เทียบงบเป้าหมาย"
            value={gap === 0 ? "ตรงงบ" : formatBaht(Math.abs(gap))}
            hint={
              gap > 0 ? "ต่ำกว่าเป้าหมาย" : gap < 0 ? "สูงกว่าเป้าหมาย" : "ตรงกัน"
            }
          />
        </div>
      </section>

      <NextStepCard
        message={
          balanced
            ? "สัดส่วนครบ 100% แล้ว — นัดทีมยืนยันก่อนเปิดร้าน"
            : `สัดส่วนรวม ${totalPercent}% — ต้องปรับให้ได้ 100%`
        }
        href="/opening/checklist"
        actionLabel="ไปรายการตรวจสอบ"
      />

      <section className="space-y-3">
        <SectionHeader title="รายละเอียด" />
        <p className="kl-type-helper">
          เดย์ · ครีม · เก็ต · เหมียว — ทีมบริหารร้านตั้งเตา
        </p>
        {OPENING_TEAM.map((member) => (
          <Card key={member.id} className="space-y-2 !p-4">
            <h2 className="kl-type-card-title">{member.name}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="kl-type-label">จำนวนเงิน</p>
                <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
                  {formatBaht(member.amount)}
                </p>
              </div>
              <div>
                <p className="kl-type-label">เปอร์เซ็นต์</p>
                <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
                  {member.percent}%
                </p>
              </div>
            </div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <SectionHeader title="Action" />
        <ButtonLink href="/opening/budget" fullWidth>
          เทียบกับงบประมาณ
        </ButtonLink>
        <ButtonLink href="/opening" variant="secondary" fullWidth>
          กลับแผนเปิดร้าน
        </ButtonLink>
      </section>
    </AppShell>
  );
}
