import EmptyState from "../../../components/ui/EmptyState";
import StatCell from "../../../components/ui/StatCell";
import { EMPTY_STATE } from "../../copy/emptyStates";
import type { FinancialSummary } from "../../lib/financialSummaryService";
import { formatProductionBaht } from "../../production/utils";

type Props = {
  hasPlan: boolean;
  summary: FinancialSummary | null;
};

export default function HomeFinancialSummary({ hasPlan, summary }: Props) {
  if (!hasPlan || !summary) {
    return <EmptyState {...EMPTY_STATE.home.noPlan} />;
  }

  return (
    <div className="kl-card">
      <div className="kl-metric-grid">
        <StatCell
          label="ต้นทุนผลิตวันนี้"
          value={`฿${formatProductionBaht(summary.totalProductionCost)}`}
        />
        <StatCell
          label="มูลค่าขายรวม"
          value={`฿${formatProductionBaht(summary.totalSellingValue)}`}
        />
        <StatCell
          label="กำไรคาดการณ์"
          value={`฿${formatProductionBaht(summary.projectedProfit)}`}
        />
        <StatCell
          label="กำไร %"
          value={`${summary.projectedProfitPercent}%`}
        />
      </div>
    </div>
  );
}
