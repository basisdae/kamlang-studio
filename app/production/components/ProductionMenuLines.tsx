import SectionTitle from "../../../components/ui/SectionTitle";
import type { ProductionMenuLineRollup } from "../../lib/productionRollupService";
import { PRODUCTION_UI } from "../copy";
import { formatProductionQuantity } from "../utils";

type Props = {
  menuLines: ProductionMenuLineRollup[];
};

export default function ProductionMenuLines({ menuLines }: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="production">{PRODUCTION_UI.sections.targetsToday}</SectionTitle>

      <div className="kl-section">
        <div className="kl-list">
          {menuLines.map((line) => (
            <div key={line.menuId} className="kl-list-row">
              <div className="min-w-0 flex-1">
                <div className="kl-type-card-title">{line.menuName}</div>
                {line.note ? (
                  <p className="kl-type-helper mt-1">{line.note}</p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <div className="kl-type-metric">
                  {formatProductionQuantity(line.quantity)}
                </div>
                <div className="kl-type-label">จาน</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
