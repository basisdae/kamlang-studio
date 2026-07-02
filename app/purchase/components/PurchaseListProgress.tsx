import Card from "../../../components/ui/Card";

type Props = {
  boughtCount: number;
  totalCount: number;
};

export default function PurchaseListProgress({
  boughtCount,
  totalCount,
}: Props) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="kl-type-caption text-kl-muted">ความคืบหน้า</div>
      <div className="kl-type-metric">
        ซื้อแล้ว {boughtCount}/{totalCount} รายการ
      </div>
    </Card>
  );
}
