"use client";

import {
  LIST_SORT_OPTIONS,
  type ListSortKey,
} from "../../app/opening/lib/listPolish";

type Props = {
  value: ListSortKey;
  onChange: (value: ListSortKey) => void;
  className?: string;
};

/**
 * Compact sort control for Opening lists.
 */
export default function ListSortSelect({
  value,
  onChange,
  className = "",
}: Props) {
  return (
    <label
      className={`flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2 rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3 ${className}`.trim()}
    >
      <span className="kl-type-caption shrink-0 text-kl-muted">เรียง</span>
      <select
        className="min-w-0 flex-1 bg-transparent text-[length:var(--kl-type-body-size)] outline-none"
        value={value}
        aria-label="เรียงรายการ"
        onChange={(e) => onChange(e.target.value as ListSortKey)}
      >
        {LIST_SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
