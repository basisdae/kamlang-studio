import Card from "../../../components/ui/Card";
import SectionTitle from "../../../components/ui/SectionTitle";
import { PRODUCTION_UI } from "../copy";
import type { ProductionPlanStatus } from "../types";
import { getProductionStatusLabel, getProductionStatusTone } from "../utils";

type Props = {
  status: ProductionPlanStatus;
  onChange: (status: ProductionPlanStatus) => void;
};

const statuses: ProductionPlanStatus[] = ["draft", "preparing", "completed"];

export default function ProductionStatusControl({ status, onChange }: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="production">{PRODUCTION_UI.sections.productionStatus}</SectionTitle>

      <Card className="grid grid-cols-3 gap-2 p-2">
        {statuses.map((option) => {
          const isActive = option === status;
          const tone = getProductionStatusTone(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`kl-type-caption min-h-11 rounded-xl px-2 py-2 kl-pressable ${
                isActive
                  ? `kl-badge-${tone === "inProgress" ? "inprogress" : tone} font-medium`
                  : "bg-kl-surface text-kl-muted"
              }`}
            >
              {getProductionStatusLabel(option)}
            </button>
          );
        })}
      </Card>
    </section>
  );
}
