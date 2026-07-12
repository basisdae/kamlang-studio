"use client";

import { useCallback, useMemo, useState } from "react";
import ListSortSelect from "../../../../components/bi/ListSortSelect";
import SectionHeader from "../../../../components/bi/SectionHeader";
import Card from "../../../../components/ui/Card";
import EmptyState from "../../../../components/ui/EmptyState";
import SearchBar from "../../../../components/ui/SearchBar";
import SegmentChip from "../../../../components/ui/SegmentChip";
import { emptyAssetForm } from "../../assets/components/AssetForm";
import { useAssets } from "../../assets/AssetsProvider";
import {
  matchesAssetSearch,
  sortAssets,
  type ListSortKey,
} from "../../lib/listPolish";
import {
  defaultCategoryForTopic,
  filterByUxStatus,
  type OpeningTopic,
  type OpeningTopicId,
  type StatusFilter,
  type TopicProgress,
} from "../../lib/openingDomain";
import type { AssetItem, AssetStatus } from "../../../../data/seed/tangtao";
import { showUndoToast } from "../../../lib/biInfoToast";
import ChecklistBulkBar from "./ChecklistBulkBar";
import ChecklistQuickAdd from "./ChecklistQuickAdd";
import ChecklistRow from "./ChecklistRow";

const STATUS_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "owned", label: "มีแล้ว" },
  { id: "need", label: "ต้องจัดหา" },
  { id: "ordered", label: "สั่งแล้ว" },
  { id: "received", label: "ได้รับแล้ว" },
];

type Props = {
  topic: OpeningTopic;
  topicAssets: AssetItem[];
  progress: TopicProgress;
};

/**
 * Fast checklist UX for one topic — Quick Add, inline edit, bulk, undo.
 */
export default function ChecklistTopicBoard({
  topic,
  topicAssets,
  progress,
}: Props) {
  const {
    addAsset,
    updateAsset,
    setStatus,
    bulkSetStatus,
    bulkArchive,
    bulkUnarchive,
    restoreStatuses,
    saving,
  } = useAssets();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ListSortKey>("name");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const byStatus = filterByUxStatus(topicAssets, statusFilter).filter((a) =>
      matchesAssetSearch(a, query)
    );
    return sortAssets(byStatus, sort);
  }, [topicAssets, statusFilter, query, sort]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((prev) => {
      if (filtered.length === 0) return prev;
      const allSelected = filtered.every((a) => prev.has(a.id));
      if (allSelected) return new Set();
      return new Set(filtered.map((a) => a.id));
    });
  }, [filtered]);

  async function handleQuickAdd(name: string) {
    const base = emptyAssetForm();
    const created = await addAsset({
      ...base,
      name,
      category: defaultCategoryForTopic(topic.id as OpeningTopicId),
      documentIds: [],
      imageUrl: null,
      purchaseHistory: [],
      repairHistory: [],
      decisionGroupId: null,
    });
    return Boolean(created);
  }

  async function handleRename(id: string, name: string) {
    const updated = await updateAsset(id, { name });
    return Boolean(updated);
  }

  async function handleBulkStatus(status: AssetStatus) {
    const ids = selectedIds;
    if (ids.length === 0) return;
    const result = await bulkSetStatus(ids, status);
    if (!result) return;
    clearSelection();
    const previous = result.previous;
    showUndoToast(`✓ เปลี่ยนสถานะแล้ว ${ids.length} รายการ`, () => {
      void restoreStatuses(previous);
    });
  }

  async function handleBulkArchive() {
    const ids = selectedIds;
    if (ids.length === 0) return;
    const ok = await bulkArchive(ids);
    if (!ok) return;
    clearSelection();
    showUndoToast(`✓ Archive แล้ว ${ids.length} รายการ`, () => {
      void bulkUnarchive(ids);
    });
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="kl-sticky-toolbar space-y-3">
        <p className="kl-type-helper">
          {progress.total === 0
            ? "ยังไม่มีรายการในหมวดนี้"
            : `มีแล้ว ${progress.owned} · ต้องจัดหา ${progress.need} · สั่งแล้ว ${progress.ordered} · ได้รับ ${progress.received}`}
        </p>

        <ChecklistQuickAdd
          topicTitle={topic.title}
          disabled={saving}
          onAdd={handleQuickAdd}
        />

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {STATUS_CHIPS.map((chip) => (
            <SegmentChip
              key={chip.id}
              label={chip.label}
              active={statusFilter === chip.id}
              onClick={() => setStatusFilter(chip.id)}
            />
          ))}
        </div>

        <SearchBar
          placeholder="ชื่อ หมายเหตุ Supplier..."
          value={query}
          onChange={setQuery}
        />
        <ListSortSelect value={sort} onChange={setSort} />

        <ChecklistBulkBar
          count={selectedIds.length}
          disabled={saving}
          onClear={clearSelection}
          onBulkStatus={(s) => void handleBulkStatus(s)}
          onBulkArchive={() => void handleBulkArchive()}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SectionHeader title="รายการ" />
          {filtered.length > 0 ? (
            <button
              type="button"
              className="kl-type-caption underline"
              onClick={toggleSelectAll}
            >
              {filtered.every((a) => selected.has(a.id))
                ? "ยกเลิกทั้งหมด"
                : "เลือกทั้งหมด"}
            </button>
          ) : null}
        </div>

        {topicAssets.length === 0 ? (
          <EmptyState
            title="ยังไม่มีรายการ"
            hint="พิมพ์ชื่อด้านบนแล้วกด Enter เพื่อเพิ่มเร็ว"
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="ไม่พบรายการ"
            hint="ลองเปลี่ยนคำค้นหรือตัวกรอง"
          />
        ) : (
          <Card className="!overflow-hidden !p-0">
            {filtered.map((item) => (
              <ChecklistRow
                key={item.id}
                item={item}
                selected={selected.has(item.id)}
                disabled={saving}
                onToggleSelect={() => toggleSelect(item.id)}
                onRename={(name) => handleRename(item.id, name)}
                onStatusChange={(status) => setStatus(item.id, status)}
              />
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}
