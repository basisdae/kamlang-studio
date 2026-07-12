"use client";

import { useMemo, useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import AttachmentCard from "../../../components/bi/AttachmentCard";
import BiListSkeleton from "../../../components/bi/BiListSkeleton";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import DocumentCard from "../../../components/bi/DocumentCard";
import NextStepCard from "../../../components/bi/NextStepCard";
import PageHeader from "../../../components/bi/PageHeader";
import QuoteCard from "../../../components/bi/QuoteCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import SummaryCard from "../../../components/bi/SummaryCard";
import SummaryMetric from "../../../components/bi/SummaryMetric";
import ButtonLink from "../../../components/ui/ButtonLink";
import EmptyState from "../../../components/ui/EmptyState";
import SearchBar from "../../../components/ui/SearchBar";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import { matchesTextSearch } from "../lib/listPolish";
import {
  getDocumentsSummary,
  groupDocumentsByParent,
  OPENING_DOCUMENTS,
  OPENING_QUOTES,
  WORKSPACE_NAME,
} from "./sampleData";

type SortKey = "name" | "created";

/**
 * Documents system (mock) — Asset / Budget / Initial Stock attachments.
 */
export default function OpeningDocumentsPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [ready] = useState(true);

  const summary = getDocumentsSummary();
  const focusQuote = OPENING_QUOTES[0];

  const quotes = useMemo(() => {
    const rows = OPENING_QUOTES.filter((q) =>
      matchesTextSearch(
        [q.title, q.parentName, q.vendor, q.detail, q.person],
        query
      )
    );
    return [...rows].sort((a, b) => {
      if (sort === "created") return b.at.localeCompare(a.at);
      return a.parentName.localeCompare(b.parentName, "th");
    });
  }, [query, sort]);

  const groups = useMemo(() => {
    const all = groupDocumentsByParent();
    const filtered = all.filter((g) =>
      matchesTextSearch(
        [
          g.parentName,
          ...g.documents.flatMap((d) => [d.title, d.detail, d.person]),
        ],
        query
      )
    );
    return [...filtered].sort((a, b) =>
      a.parentName.localeCompare(b.parentName, "th")
    );
  }, [query]);

  const nonQuoteDocs = useMemo(() => {
    const rows = OPENING_DOCUMENTS.filter(
      (d) =>
        d.kind !== "quote" &&
        matchesTextSearch(
          [d.title, d.parentName, d.detail, d.person],
          query
        )
    );
    return [...rows].sort((a, b) => {
      if (sort === "created") return b.at.localeCompare(a.at);
      return a.title.localeCompare(b.title, "th");
    });
  }, [query, sort]);

  if (!ready) {
    return (
      <AppShell title="" hidePageHeader compact backHref="/opening">
        <BiListSkeleton rows={4} />
      </AppShell>
    );
  }

  const hasAny =
    OPENING_DOCUMENTS.length > 0 || OPENING_QUOTES.length > 0;
  const hasVisible =
    quotes.length > 0 || groups.length > 0 || nonQuoteDocs.length > 0;

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
          <SummaryMetric label="ทั้งหมด" value={`${summary.total}`} />
          <SummaryMetric label="ใบเสนอราคา" value={`${summary.quoteCount}`} />
          <SummaryMetric
            label="รายการที่มีไฟล์"
            value={`${summary.parentsWithDocs}`}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SummaryMetric label="ทรัพย์สิน" value={`${summary.byParent.asset}`} />
          <SummaryMetric label="งบประมาณ" value={`${summary.byParent.budget}`} />
          <SummaryMetric
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

      <SearchBar
        placeholder="ชื่อ หมายเหตุ Supplier..."
        value={query}
        onChange={setQuery}
      />
      <label className="flex min-h-[2.75rem] items-center gap-2 rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3">
        <span className="kl-type-caption shrink-0 text-kl-muted">เรียง</span>
        <select
          className="min-w-0 flex-1 bg-transparent outline-none"
          value={sort}
          aria-label="เรียงรายการ"
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="name">ชื่อ</option>
          <option value="created">วันที่สร้าง</option>
        </select>
      </label>

      {!hasAny ? (
        <EmptyState
          title="ยังไม่มีรายการ"
          hint="ยังไม่มีเอกสารแนบ"
          actionLabel="+ เพิ่มรายการ"
          actionHref="/opening/assets"
        />
      ) : !hasVisible ? (
        <EmptyState
          title="ไม่พบรายการ"
          hint="ลองเปลี่ยนคำค้น"
          actionLabel="ไปทรัพย์สิน"
          actionHref="/opening/assets"
        />
      ) : (
        <>
          <section className="space-y-3">
            <SectionHeader title="ใบเสนอราคา" />
            {quotes.length === 0 ? (
              <EmptyState
                title="ไม่พบใบเสนอราคา"
                hint="ลองเปลี่ยนคำค้น"
              />
            ) : (
              <div className="space-y-3">
                {quotes.map((quote) => (
                  <QuoteCard key={quote.id} quote={quote} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader title="แนบกับรายการ" />
            <p className="kl-type-helper">
              ทุก Asset · Budget · Initial Stock แนบได้ 6 ประเภท
            </p>
            {groups.length === 0 ? (
              <EmptyState title="ไม่พบรายการ" hint="ลองเปลี่ยนคำค้น" />
            ) : (
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
            )}
          </section>

          <section className="space-y-3">
            <SectionHeader title="เอกสารอื่น" />
            {nonQuoteDocs.length === 0 ? (
              <EmptyState title="ไม่พบเอกสาร" hint="ลองเปลี่ยนคำค้น" />
            ) : (
              <div className="space-y-3">
                {nonQuoteDocs.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <ButtonLink href="/opening" fullWidth>
        กลับแผนเปิดร้าน
      </ButtonLink>
    </AppShell>
  );
}
