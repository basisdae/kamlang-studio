import Link from "next/link";
import Card from "../ui/Card";
import {
  ASSET_STATUS_LABELS,
  formatBaht,
  type AssetItem,
} from "../../app/opening/sampleData";

/** @deprecated Prefer opening/assets list components — kept for any leftover imports */
export default function AssetCard({ item }: { item: AssetItem }) {
  const unit = item.actualPrice ?? item.estimatedPrice;
  const total = unit != null ? unit * item.quantity : null;

  return (
    <Link href={`/opening/assets/${item.id}`} className="block kl-pressable">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="kl-type-card-title">{item.name}</h3>
            <p className="kl-type-helper mt-1">{item.category}</p>
          </div>
          <span className="shrink-0 rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-1 kl-type-caption">
            {ASSET_STATUS_LABELS[item.status]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="kl-type-label">ประเมิน</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {item.estimatedPrice != null
                ? formatBaht(item.estimatedPrice)
                : "ยังไม่มีราคา"}
            </p>
          </div>
          <div>
            <p className="kl-type-label">ยอดรวม</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {total != null ? formatBaht(total) : "—"}
            </p>
          </div>
        </div>
        <p className="kl-type-caption font-medium text-[var(--bi-text-primary)]">
          ดูรายละเอียด →
        </p>
      </Card>
    </Link>
  );
}
