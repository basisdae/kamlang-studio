"use client";

import Link from "next/link";
import {
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_LABELS,
  type AssetItem,
} from "../../../../data/seed/tangtao";
import { formatBaht } from "../../sampleData";

type AssetCompactRowProps = {
  item: AssetItem;
};

export default function AssetCompactRow({ item }: AssetCompactRowProps) {
  const unit = item.actualPrice ?? item.estimatedPrice;
  const priceLabel = unit != null ? formatBaht(unit) : "ยังไม่มีราคา";
  const hasSupplier = Boolean(item.supplier.trim());

  return (
    <Link
      href={`/opening/assets/${item.id}`}
      className="flex min-h-[2.75rem] items-start gap-3 border-b border-[var(--kl-border)] px-3 py-2.5 kl-pressable last:border-b-0"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="kl-type-card-title truncate">{item.name}</p>
        </div>
        <p className="kl-type-helper mt-0.5 truncate">
          {item.category} · {item.quantity} {item.unit} ·{" "}
          {ASSET_PRIORITY_LABELS[item.priority]}
        </p>
        <p className="kl-type-caption mt-0.5">
          {hasSupplier ? `ร้านซื้อเดิม: ${item.supplier}` : "ยังไม่มีร้านซื้อเดิม"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="kl-type-caption">{ASSET_STATUS_LABELS[item.status]}</p>
        <p className="kl-type-body mt-0.5 tabular-nums">{priceLabel}</p>
      </div>
    </Link>
  );
}
