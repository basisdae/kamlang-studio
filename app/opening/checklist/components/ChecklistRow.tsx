"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ASSET_STATUS_FLOW,
  ASSET_STATUS_LABELS,
  type AssetItem,
  type AssetStatus,
} from "../../../../data/seed/tangtao";

type Props = {
  item: AssetItem;
  selected: boolean;
  onToggleSelect: () => void;
  onRename: (name: string) => Promise<boolean>;
  onStatusChange: (status: AssetStatus) => Promise<void>;
  disabled?: boolean;
};

/**
 * Checklist row — checkbox, inline name edit, status select.
 */
export default function ChecklistRow({
  item,
  selected,
  onToggleSelect,
  onRename,
  onStatusChange,
  disabled = false,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(item.name);
  }, [item.name]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function commit() {
    const next = draft.trim();
    if (!next || next === item.name) {
      setDraft(item.name);
      setEditing(false);
      return;
    }
    setSaving(true);
    const ok = await onRename(next);
    setSaving(false);
    if (ok) setEditing(false);
    else setDraft(item.name);
  }

  function cancelEdit() {
    setDraft(item.name);
    setEditing(false);
  }

  return (
    <div className="flex min-h-[2.75rem] items-start gap-2 border-b border-[var(--kl-border)] px-2 py-2.5 last:border-b-0">
      <input
        type="checkbox"
        className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--bi-lemon)]"
        checked={selected}
        disabled={disabled}
        aria-label={`เลือก ${item.name}`}
        onChange={onToggleSelect}
      />

      <div className="min-w-0 flex-1 space-y-1.5">
        {editing ? (
          <input
            ref={inputRef}
            className="w-full min-h-[2.25rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-2 text-[length:var(--kl-type-body-size)] outline-none"
            value={draft}
            disabled={saving || disabled}
            aria-label="แก้ไขชื่อ"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void commit();
              } else if (e.key === "Escape") {
                e.preventDefault();
                cancelEdit();
              }
            }}
            onBlur={() => void commit()}
          />
        ) : (
          <button
            type="button"
            className="kl-type-body w-full truncate text-left font-medium kl-pressable"
            disabled={disabled}
            onClick={() => setEditing(true)}
          >
            {item.name}
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="min-h-[2rem] max-w-full rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-surface px-2 text-[length:var(--kl-type-caption-size,0.75rem)] outline-none"
            value={item.status}
            disabled={disabled || saving}
            aria-label={`สถานะ ${item.name}`}
            onChange={(e) =>
              void onStatusChange(e.target.value as AssetStatus)
            }
          >
            {ASSET_STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <Link
            href={`/opening/assets/${item.id}`}
            className="kl-type-caption underline text-[var(--bi-text-primary)]"
          >
            รายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}
