import StatCell from "../../../../components/ui/StatCell";
import type { MenuCostBreakdown } from "../../../lib/menuCostService";
import { formatMenuBaht } from "../../utils";

type Props = {
  cost: MenuCostBreakdown;
};

export default function MenuCostSummary({ cost }: Props) {
  return (
    <section className="space-y-3">
      <details className="kl-details">
        <summary className="kl-details-summary">ดูต้นทุนและกำไร</summary>
        <div className="kl-details-body space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCell
              label="ต้นทุนสูตร"
              value={`฿${formatMenuBaht(cost.recipeCost)}`}
            />
            <StatCell
              label="บรรจุภัณฑ์"
              value={`฿${formatMenuBaht(cost.packagingCost)}`}
            />
          </div>

          <div className="kl-stat text-center">
        <div className="kl-type-label">ต้นทุนรวม</div>
            <div className="kl-type-metric-lg mt-1">
              ฿{formatMenuBaht(cost.totalCost)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCell
              label="กำไร"
              value={`฿${formatMenuBaht(cost.grossProfit)}`}
            />
            <StatCell
              label="กำไร %"
              value={`${cost.grossProfitPercent}%`}
            />
          </div>
        </div>
      </details>
    </section>
  );
}
