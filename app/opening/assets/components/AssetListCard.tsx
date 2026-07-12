"use client";

import Link from "next/link";
import Card from "../../../../components/ui/Card";
import StatusBadge from "../../../../components/bi/StatusBadge";
import Badge from "../../../../components/ui/Badge";
import {
  assetHasNoPrice,
  type AssetItem,
} from "../../../../data/seed/tangtao";
import { formatBaht } from "../../sampleData";

export default function AssetListCard({ item }: { item: AssetItem }) {
  const noPrice = assetHasNoPrice(item);
  const unit = item.estimatedPrice;
  const total = unit != null ? unit * item.quantity : null;
  const hasSupplier = Boolean(item.supplier.trim());

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="kl-type-card-title">{item.name}</h3>
            {noPrice ? <Badge tone="draft">ยังไม่ใส่ราคา</Badge> : null}
          </div>
          <p className="kl-type-helper mt-1">
            {item.category}
            {item.brand ? ` · ${item.brand}` : ""}
            {item.model ? ` ${item.model}` : ""}
          </p>
        </div>
        <StatusBadge assetStatus={item.status} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="kl-type-label">จำนวน</p>
          <p className="kl-type-body mt-1">
            {item.quantity} {item.unit}
          </p>
        </div>
        <div>
          <p className="kl-type-label">Priority</p>
          <p className="kl-type-body mt-1">
            <StatusBadge priority={item.priority} />
          </p>
        </div>
        <div>
          <p className="kl-type-label">มูลค่า</p>
          <p className="kl-type-body mt-1">
            {total != null ? formatBaht(total) : "ยังไม่ใส่ราคา"}
          </p>
        </div>
      </div>
      <p className="kl-type-caption">
        {hasSupplier ? `ร้านซื้อเดิม: ${item.supplier}` : "ยังไม่มีร้านซื้อเดิม"}
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/opening/assets/${item.id}`}
          className="kl-type-caption font-medium text-[var(--bi-text-primary)]"
        >
          ดูรายละเอียด →
        </Link>
        {noPrice ? (
          <Link
            href={`/opening/assets/${item.id}/edit`}
            className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline"
          >
            ใส่ราคา
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
