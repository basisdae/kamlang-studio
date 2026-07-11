"use client";

import Link from "next/link";
import {
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_LABELS,
  assetHasNoPrice,
  type AssetItem,
} from "../../../../data/seed/tangtao";
import { formatBaht } from "../../sampleData";

type AssetCompactRowProps = {
  item: AssetItem;
};

export default function AssetCompactRow({ item }: AssetCompactRowProps) {
  const noPrice = assetHasNoPrice(item);
  const unit = item.estimatedPrice;
  const hasSupplier = Boolean(item.supplier.trim());

  return (
    <div className="flex min-h-[2.75rem] items-start gap-3 border-b border-[var(--kl-border)] px-3 py-2.5 last:border-b-0">
      <Link
        href={`/opening/assets/${item.id}`}
        className="min-w-0 flex-1 kl-pressable"
      >
        <div className="flex flex-wrap items-center gap-2">
          <p className="kl-type-card-title truncate">{item.name}</p>
          {noPrice ? (
            <span className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-0.5 kl-type-caption">
              ยังไม่ใส่ราคา
            </span>
          ) : null}
        </div>
        <p className="kl-type-helper mt-0.5 truncate">
          {item.category} · {item.quantity} {item.unit} ·{" "}
          {ASSET_PRIORITY_LABELS[item.priority]}
        </p>
        <p className="kl-type-caption mt-0.5">
          {hasSupplier ? `ร้านซื้อเดิม: ${item.supplier}` : "ยังไม่มีร้านซื้อเดิม"}
        </p>
      </Link>
      <div className="shrink-0 text-right space-y-1">
        <p className="kl-type-caption">{ASSET_STATUS_LABELS[item.status]}</p>
        <p className="kl-type-body mt-0.5 tabular-nums">
          {noPrice ? "ยังไม่ใส่ราคา" : formatBaht(unit!)}
        </p>
        {noPrice ? (
          <Link
            href={`/opening/assets/${item.id}/edit`}
            className="inline-block kl-type-caption font-medium text-[var(--bi-text-primary)] underline"
          >
            ใส่ราคา
          </Link>
        ) : null}
      </div>
    </div>
  );
}
