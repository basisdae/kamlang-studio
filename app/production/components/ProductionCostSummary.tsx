import StatCell from "../../../components/ui/StatCell";
import type { ProductionRollup } from "../../lib/productionRollupService";
import { formatProductionBaht } from "../utils";

type Props = Pick<
  ProductionRollup,
  "totalRecipeCost" | "totalPackagingCost" | "totalCost"
>;

export default function ProductionCostSummary({
  totalRecipeCost,
  totalPackagingCost,
  totalCost,
}: Props) {
  return (
    <details className="kl-details">
      <summary className="kl-details-summary">ดูสรุปต้นทุน</summary>
      <div className="kl-details-body space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatCell
            label="ต้นทุนทำอาหาร"
            value={`฿${formatProductionBaht(totalRecipeCost)}`}
          />
          <StatCell
            label="ของห่อกลับ"
            value={`฿${formatProductionBaht(totalPackagingCost)}`}
          />
        </div>
        <div className="kl-stat text-center">
          <div className="kl-type-label">ต้นทุนรวม</div>
          <div className="kl-type-metric-lg mt-1">
            ฿{formatProductionBaht(totalCost)}
          </div>
        </div>
      </div>
    </details>
  );
}
