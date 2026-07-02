import SectionTitle from "../../../components/ui/SectionTitle";
import type { IngredientTotal } from "../../lib/productionRollupService";
import { PRODUCTION_UI } from "../copy";
import { formatProductionQuantity } from "../utils";

type Props = {
  ingredientTotals: IngredientTotal[];
};

export default function ProductionIngredientTotals({
  ingredientTotals,
}: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="production">{PRODUCTION_UI.sections.ingredientsToPrep}</SectionTitle>

      <div className="kl-section">
        <div className="kl-list">
          {ingredientTotals.map((item) => (
            <div
              key={`${item.ingredientId}-${item.unit}`}
              className="kl-list-row"
            >
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
    </section>
  );
}
