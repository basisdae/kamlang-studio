"use client";

import { useMemo, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../../components/layout/AppShell";
import BiDataStatus from "../../../../components/bi/BiDataStatus";
import PageHeader from "../../../../components/bi/PageHeader";
import SectionHeader from "../../../../components/bi/SectionHeader";
import ButtonLink from "../../../../components/ui/ButtonLink";
import Card from "../../../../components/ui/Card";
import EmptyState from "../../../../components/ui/EmptyState";
import SearchBar from "../../../../components/ui/SearchBar";
import { useWorkspace } from "../../../providers/WorkspaceProvider";
import { useAssets } from "../../assets/AssetsProvider";
import AssetCompactRow from "../../assets/components/AssetCompactRow";
import {
  assetsForTopic,
  filterByUxStatus,
  getTopic,
  topicProgress,
  type OpeningTopicId,
  type StatusFilter,
} from "../../lib/openingDomain";

const STATUS_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "owned", label: "มีแล้ว" },
  { id: "need", label: "ต้องจัดหา" },
  { id: "ordered", label: "สั่งแล้ว" },
  { id: "received", label: "ได้รับแล้ว" },
];

/**
 * Checklist topic — same bi_assets rows as Assets / Budget views.
 */
export default function OpeningChecklistTopicPage() {
  const params = useParams();
  const topicId = String(params.topic ?? "");
  const topic = getTopic(topicId);

  const { workspaceName } = useWorkspace();
  const {
    assets,
    loading,
    ready,
    online,
    configured,
    browserOffline,
    error,
    retry,
  } = useAssets();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");

  const progress = useMemo(
    () => (topic ? topicProgress(assets, topic) : null),
    [assets, topic]
  );
  const topicAssets = useMemo(
    () =>
      topic ? assetsForTopic(assets, topic.id as OpeningTopicId) : [],
    [assets, topic]
  );

  const filtered = useMemo(() => {
    const byStatus = filterByUxStatus(topicAssets, statusFilter);
    const q = query.trim().toLowerCase();
    if (!q) return byStatus;
    return byStatus.filter((a) =>
      `${a.name} ${a.supplier} ${a.category}`.toLowerCase().includes(q)
    );
  }, [topicAssets, statusFilter, query]);

  if (!topic || !progress) {
    notFound();
  }

  if (topic.externalHref) {
    return (
      <AppShell title="" hidePageHeader compact backHref="/opening/checklist">
        <PageHeader
          title="รายการเตรียมเปิดร้าน"
          workspace={workspaceName}
          subtitle={topic.title}
        />
        <Card className="space-y-3 !p-4">
          <p className="kl-type-card-title">{topic.title}</p>
          <p className="kl-type-helper">{topic.description}</p>
          <ButtonLink href={topic.externalHref} fullWidth>
            ไปจัดการ{topic.title}
          </ButtonLink>
          <ButtonLink href="/opening/checklist" variant="secondary" fullWidth>
            กลับรายการเตรียมเปิดร้าน
          </ButtonLink>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening/checklist">
      <PageHeader
        title="รายการเตรียมเปิดร้าน"
        workspace={workspaceName}
        subtitle={topic.title}
      />
      <p className="kl-type-helper -mt-1">
        {progress.total === 0
          ? "ยังไม่มีรายการในหมวดนี้"
          : `มีแล้ว ${progress.owned} · ต้องจัดหา ${progress.need} · สั่งแล้ว ${progress.ordered} · ได้รับ ${progress.received}`}
      </p>

      <BiDataStatus
        loading={loading}
        ready={ready}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={error}
        empty={ready && !loading && !error && online && topicAssets.length === 0}
        hasCachedData={false}
        emptyTitle={`ยังไม่มี${topic.title}`}
        emptyHint="เพิ่มรายการ — ข้อมูลชุดเดียวกับทุกหน้าเปิดร้าน"
        sourceHint={
          online
            ? `รายการเตรียมเปิดร้าน · ${topic.title}`
            : "แหล่งข้อมูล: โหลดไม่สำเร็จ"
        }
        skeletonRows={4}
        onRetry={() => void retry()}
      />

      {!loading && !error ? (
        <>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setStatusFilter(chip.id)}
                className={`kl-segment-btn shrink-0 whitespace-nowrap kl-pressable ${
                  statusFilter === chip.id
                    ? "bg-[var(--bi-lemon)] text-[var(--bi-text-primary)]"
                    : "bg-kl-surface text-kl-muted"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <SearchBar
            placeholder="ชื่อ Supplier หมวด..."
            value={query}
            onChange={setQuery}
          />

          <section className="space-y-3">
            <SectionHeader title="รายการ" />
            {filtered.length === 0 ? (
              <EmptyState
                title="ไม่พบรายการ"
                hint="ลองเปลี่ยนตัวกรอง หรือเพิ่มรายการใหม่"
                actionLabel="เพิ่มรายการ"
                actionHref="/opening/assets/new"
              />
            ) : (
              <Card className="!overflow-hidden !p-0">
                {filtered.map((item) => (
                  <AssetCompactRow key={item.id} item={item} />
                ))}
              </Card>
            )}
          </section>

          <div className="space-y-2">
            <ButtonLink href="/opening/assets/new" fullWidth>
              เพิ่มใน{topic.title}
            </ButtonLink>
            <p className="kl-type-caption text-center">
              ดูรายละเอียดรายการได้ที่{" "}
              <Link
                href="/opening/assets"
                className="underline text-[var(--bi-text-primary)]"
              >
                ทรัพย์สิน
              </Link>
            </p>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
