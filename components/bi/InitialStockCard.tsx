import Link from "next/link";
import Card from "../ui/Card";
import { formatBaht, type InitialStockItem } from "../../app/opening/sampleData";

export default function InitialStockCard({
  item,
}: {
  item: InitialStockItem;
}) {
  return (
    <Card className="space-y-2">
      <h3 className="kl-type-card-title">{item.name}</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="kl-type-label">จำนวน</p>
          <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
            {item.quantity.toLocaleString("th-TH")} {item.unit}
          </p>
        </div>
        <div>
          <p className="kl-type-label">ประมาณการ</p>
          <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
            {item.estimatedCost != null
              ? formatBaht(item.estimatedCost)
              : "ยังไม่มีราคา"}
          </p>
        </div>
      </div>
      <Link
        href="/opening/documents"
        className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline-offset-2 kl-pressable"
      >
        เอกสาร →
      </Link>
    </Card>
  );
}
