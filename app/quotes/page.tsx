import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import NextStepCard from "../../components/bi/NextStepCard";
import PageHeader from "../../components/bi/PageHeader";
import QuoteCompareBoard from "../../components/bi/QuoteCompareBoard";
import SectionHeader from "../../components/bi/SectionHeader";
import SummaryCard from "../../components/bi/SummaryCard";
import ButtonLink from "../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import {
  QUOTE_COMPARE_GROUPS,
  WORKSPACE_NAME,
} from "./sampleData";

/**
 * Quote Compare — Card UI only (no scoring yet)
 * Pattern: Header → Summary → Next Action → Content → Primary Action
 */
export default function QuotesPage() {
  const group = QUOTE_COMPARE_GROUPS[0];
  const optionCount = group?.options.length ?? 0;

  return (
    <AppShell title="" hidePageHeader compact>
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        subtitle="Quote Compare"
      />
      <p className="kl-type-helper -mt-1">
        เปรียบเทียบใบเสนอราคา · เลือก Best Price / Value / Recommended
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <SummaryCard title="กำลังเปรียบเทียบ">
        <div className="grid grid-cols-2 gap-2">
          <Metric label="รายการ" value={group?.itemName ?? "—"} />
          <Metric label="ใบเสนอราคา" value={`${optionCount}`} />
        </div>
        <p className="kl-type-helper">
          ยังไม่คำนวณอัตโนมัติ — เลือกด้วยมือบนการ์ด
        </p>
      </SummaryCard>

      <NextStepCard
        message={
          group
            ? `เปรียบเทียบ “${group.itemName}” แล้วเลือก Best Price / Best Value / Recommended`
            : "ยังไม่มีใบเสนอราคาให้เทียบ"
        }
        href={group?.href ?? "/opening/budget"}
        actionLabel="ดูรายการทรัพย์สิน"
      />

      <section className="space-y-3">
        <SectionHeader title="เปรียบเทียบ" />
        {group ? <QuoteCompareBoard group={group} /> : null}
      </section>

      <ButtonLink href="/decisions" fullWidth>
        ไป Decisions
      </ButtonLink>
      <ButtonLink href="/opening/documents" variant="secondary" fullWidth>
        ไปเอกสาร
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
