import AppShell from "../../../components/layout/AppShell";
import AttachmentCard from "../../../components/bi/AttachmentCard";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import DocumentCard from "../../../components/bi/DocumentCard";
import NextStepCard from "../../../components/bi/NextStepCard";
import PageHeader from "../../../components/bi/PageHeader";
import QuoteCard from "../../../components/bi/QuoteCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import ButtonLink from "../../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import {
  getDocumentsSummary,
  groupDocumentsByParent,
  OPENING_DOCUMENTS,
  OPENING_QUOTES,
  WORKSPACE_NAME,
} from "./sampleData";

/**
 * Documents system (mock) — Asset / Budget / Initial Stock attachments.
 * Pattern: Header → Summary → Next Action → Content → Primary Action
 */
export default function OpeningDocumentsPage() {
  const summary = getDocumentsSummary();
  const groups = groupDocumentsByParent();
  const focusQuote = OPENING_QUOTES[0];
  const nonQuoteDocs = OPENING_DOCUMENTS.filter((d) => d.kind !== "quote");

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="แผนเปิดร้าน"
        workspace={WORKSPACE_NAME}
        subtitle="เอกสาร"
      />
      <p className="kl-type-helper -mt-1">
        แนบรูป PDF ใบเสนอราคา ใบเสร็จ Warranty Serial — Mock UI
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <SummaryCard title="เอกสารเปิดร้าน">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="ทั้งหมด" value={`${summary.total}`} />
          <Metric label="ใบเสนอราคา" value={`${summary.quoteCount}`} />
          <Metric label="รายการที่มีไฟล์" value={`${summary.parentsWithDocs}`} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="ทรัพย์สิน" value={`${summary.byParent.asset}`} />
          <Metric label="งบประมาณ" value={`${summary.byParent.budget}`} />
          <Metric
            label="วัตถุดิบ"
            value={`${summary.byParent.initial_stock}`}
          />
        </div>
      </SummaryCard>

      <NextStepCard
        message={
          focusQuote
            ? `มีใบเสนอราคา “${focusQuote.parentName}” จาก ${focusQuote.vendor} — ควรตัดสินใจ`
            : "ยังไม่มีใบเสนอราคา — แนบจากงบหรือทรัพย์สิน"
        }
        href="/opening/budget"
        actionLabel="ไปงบประมาณ"
      />

      <section className="space-y-3">
        <SectionHeader title="ใบเสนอราคา" />
        <div className="space-y-3">
          {OPENING_QUOTES.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="แนบกับรายการ" />
        <p className="kl-type-helper">
          ทุก Asset · Budget · Initial Stock แนบได้ 6 ประเภท
        </p>
        <div className="space-y-3">
          {groups.map((group) => (
            <AttachmentCard
              key={`${group.parentType}:${group.parentId}`}
              parentType={group.parentType}
              parentName={group.parentName}
              documents={group.documents}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="เอกสารอื่น" />
        <div className="space-y-3">
          {nonQuoteDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </section>

      <ButtonLink href="/opening" fullWidth>
        กลับแผนเปิดร้าน
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
