"use client";

import {
  ASSET_STATUS_FLOW,
  ASSET_STATUS_LABELS,
  type AssetStatus,
} from "../../../../data/seed/tangtao";
import Button from "../../../../components/ui/Button";

type Props = {
  count: number;
  disabled?: boolean;
  onClear: () => void;
  onBulkStatus: (status: AssetStatus) => void;
  onBulkArchive: () => void;
};

/**
 * Bulk actions when checklist rows are selected.
 */
export default function ChecklistBulkBar({
  count,
  disabled = false,
  onClear,
  onBulkStatus,
  onBulkArchive,
}: Props) {
  if (count === 0) return null;

  return (
    <div
      className="flex flex-col gap-2 rounded-[var(--kl-radius-inner)] border border-[var(--bi-lemon)] bg-[rgb(231_246_91/0.22)] p-3"
      role="toolbar"
      aria-label="จัดการหลายรายการ"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="kl-type-body font-medium">เลือกแล้ว {count} รายการ</p>
        <button
          type="button"
          className="kl-type-caption underline"
          onClick={onClear}
        >
          ยกเลิกการเลือก
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="flex min-h-[2.75rem] min-w-0 flex-1 items-center gap-2 rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3">
          <span className="kl-type-caption shrink-0">สถานะ</span>
          <select
            className="min-w-0 flex-1 bg-transparent outline-none"
            disabled={disabled}
            aria-label="เปลี่ยนสถานะหลายรายการ"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value as AssetStatus | "";
              if (!v) return;
              onBulkStatus(v);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              เปลี่ยนสถานะ...
            </option>
            {ASSET_STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="secondary"
          className="min-h-[2.75rem]"
          disabled={disabled}
          onClick={onBulkArchive}
        >
          Archive
        </Button>
      </div>
    </div>
  );
}
