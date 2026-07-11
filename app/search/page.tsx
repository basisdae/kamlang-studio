"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import PageHeader from "../../components/bi/PageHeader";
import SectionHeader from "../../components/bi/SectionHeader";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import { WORKSPACE_NAME } from "../../data/seed/tangtao";
import {
  getSearchIndexCount,
  searchSeed,
  type SearchGroupResult,
} from "./biSearch";

const SUGGESTIONS = [
  "เตา",
  "POS",
  "Makro",
  "Shopee",
  "Packaging",
  "เดย์",
  "ใบเสนอราคา",
] as const;

/**
 * System search — Seed Data only · Grouped Card results
 */
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => searchSeed(query), [query]);
  const totalHits = groups.reduce((sum, g) => sum + g.hits.length, 0);
  const indexCount = getSearchIndexCount();

  return (
    <AppShell title="" hidePageHeader compact>
      <PageHeader
        title="Business Insight"
        workspace={WORKSPACE_NAME}
        subtitle="ค้นหา"
      />
      <p className="kl-type-helper -mt-1">
        อุปกรณ์ · วัตถุดิบ · Supplier · หุ้นส่วน · Budget · Checklist ·
        Documents · Quote
      </p>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <SearchBar
        placeholder="ค้นหา เช่น เตา, Makro, Packaging..."
        value={query}
        onChange={setQuery}
      />

      <Card className="!p-3.5">
        <p className="kl-type-helper">
          {query.trim()
            ? `พบ ${totalHits} รายการ · Seed ${indexCount} รายการ`
            : `ตัวอย่างจาก Seed · ทั้งหมด ${indexCount} รายการ`}
        </p>
      </Card>

      {!query.trim() ? (
        <section className="space-y-2">
          <SectionHeader title="ลองค้นหา" />
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => setQuery(word)}
                className="kl-segment-btn bg-kl-surface text-kl-muted kl-pressable"
              >
                {word}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-5">
        {groups.length === 0 ? (
          <Card className="!p-4">
            <p className="kl-type-card-title">ไม่พบผลลัพธ์</p>
            <p className="kl-type-helper mt-1">
              ลองคำอื่น เช่น POS · Makro · Packaging
            </p>
          </Card>
        ) : (
          groups.map((group) => <SearchGroupCard key={group.group} group={group} />)
        )}
      </section>
    </AppShell>
  );
}

function SearchGroupCard({ group }: { group: SearchGroupResult }) {
  return (
    <div className="space-y-2">
      <h2 className="kl-type-label px-0.5">{group.label}</h2>
      <Card className="divide-y divide-[var(--kl-border)] !p-0 overflow-hidden">
        {group.hits.map((hit) => (
          <Link
            key={hit.id}
            href={hit.href}
            className="flex min-h-[3.25rem] items-center justify-between gap-3 px-4 py-3 kl-pressable"
          >
            <div className="min-w-0">
              <p className="kl-type-card-title truncate">{hit.title}</p>
              {hit.subtitle ? (
                <p className="kl-type-helper mt-0.5 truncate">{hit.subtitle}</p>
              ) : null}
            </div>
            <span className="kl-type-caption shrink-0 text-kl-muted">→</span>
          </Link>
        ))}
      </Card>
    </div>
  );
}
