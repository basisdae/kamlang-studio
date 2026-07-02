import type { PackagingTotal } from "../../lib/productionRollupService";
import EmptyState from "../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../copy/emptyStates";
import { formatProductionQuantity } from "../utils";

type Props = {
  packagingTotals: PackagingTotal[];
};

export default function ProductionPackagingTotals({
  packagingTotals,
}: Props) {
  if (packagingTotals.length === 0) {
    return <EmptyState {...EMPTY_STATE.production.packaging} />;
  }

  return (
    <div className="kl-section">
      <div className="kl-list">
        {packagingTotals.map((item) => (
          <div key={item.packagingItemId} className="kl-list-row">
            <div className="kl-type-card-title">{item.name}</div>
            <div className="shrink-0 text-right">
              <div className="kl-type-metric">
                {formatProductionQuantity(item.quantity)}
              </div>
              <div className="kl-type-label">{item.unit}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
