import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import NextStepCard from "../../components/bi/NextStepCard";
import PageHeader from "../../components/bi/PageHeader";
import PartnerCard from "../../components/bi/PartnerCard";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import ButtonLink from "../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import { formatBaht } from "../opening/sampleData";
import {
  getPartnersSummary,
  PARTNERS,
  WORKSPACE_NAME,
} from "./sampleData";

/**
 * Partner Dashboard — Investment view for Tang Tao partners.
 * Cards only · ROI fields are placeholders.
 * Pattern: Header → Summary → Next Action → Content → Primary Action
 */
export default function PartnersPage() {
  const summary = getPartnersSummary();

  return (
    <AppShell title="" hidePageHeader compact>
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        subtitle="Partner Dashboard"
      />
      <p className="kl-type-helper -mt-1">
        หุ้นส่วนร้านตั้งเตา · เดย์ · ครีม · เก็ต · เหมียว
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <SummaryCard title="สรุปการลงทุน">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="หุ้นส่วน" value={`${summary.count}`} />
          <Metric label="ทำงานอยู่" value={`${summary.activeCount}`} />
          <Metric
            label="เงินลงทุนรวม"
            value={formatBaht(summary.totalInvestment)}
          />
          <Metric label="สัดส่วนรวม" value={`${summary.totalPercent}%`} />
        </div>
        <p className="kl-type-helper">
          การคืนทุน · เงินปันผล · เบิกคืน — ยังเป็น Placeholder
        </p>
      </SummaryCard>

      <NextStepCard
        message="สัดส่วนครบ 100% แล้ว — นัดทีมยืนยันบทบาทและความรับผิดชอบก่อนเปิด"
        href="/opening/team"
        actionLabel="ดูทีมบริหาร"
      />

      <section className="space-y-3">
        <SectionHeader title="หุ้นส่วน" />
        <div className="space-y-3">
          {PARTNERS.map((partner) => (
            <PartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </section>

      <ButtonLink href="/opening" fullWidth>
        ไปแผนเปิดร้าน
      </ButtonLink>
      <ButtonLink href="/opening/team" variant="secondary" fullWidth>
        เทียบกับทีมบริหาร
      </ButtonLink>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
        {value}
      </p>
    </div>
  );
}
