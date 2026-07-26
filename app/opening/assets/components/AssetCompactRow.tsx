"use client";

import StatusBadge from "../../../../components/bi/StatusBadge";
import Badge from "../../../../components/ui/Badge";
import {
  ASSET_PRIORITY_LABELS,
  assetHasNoPrice,
  type AssetItem,
} from "../../../../data/seed/tangtao";
import { formatBaht } from "../../sampleData";

type AssetCompactRowProps = {
  item: AssetItem;
  onOpenQuickView: (item: AssetItem) => void;
};

export default function AssetCompactRow({
  item,
  onOpenQuickView,
}: AssetCompactRowProps) {
  const noPrice = assetHasNoPrice(item);
  const unit = item.estimatedPrice;
  const hasSupplier = Boolean(item.supplier.trim());

  return (
    <div className="flex min-h-[2.75rem] items-start gap-3 border-b border-[var(--kl-border)] px-3 py-2.5 last:border-b-0">
      <button
        type="button"
        className="min-w-0 flex-1 text-left kl-pressable"
        onClick={() => onOpenQuickView(item)}
        aria-label={`แก้ไขด่วน ${item.name}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="kl-type-card-title truncate">{item.name}</p>
          {noPrice ? <Badge tone="draft">ยังไม่ใส่ราคา</Badge> : null}
        </div>
        <p className="kl-type-helper mt-0.5 truncate">
          {item.category} · {item.quantity} {item.unit} ·{" "}
          {ASSET_PRIORITY_LABELS[item.priority]}
        </p>
        <p className="kl-type-caption mt-0.5">
          {hasSupplier ? `ร้านซื้อเดิม: ${item.supplier}` : "ยังไม่มีร้านซื้อเดิม"}
        </p>
      </button>
      <div className="shrink-0 text-right space-y-1">
        <StatusBadge assetStatus={item.status} />
        <p className="kl-type-body mt-0.5 tabular-nums">
          {noPrice ? "ยังไม่ใส่ราคา" : formatBaht(unit!)}
        </p>
        {noPrice ? (
          <button
            type="button"
            className="inline-block kl-type-caption font-medium text-[var(--bi-text-primary)] underline kl-pressable"
            onClick={() => onOpenQuickView(item)}
          >
            ใส่ราคา
          </button>
        ) : null}
      </div>
    </div>
  );
}
