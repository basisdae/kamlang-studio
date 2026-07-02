import Badge from "../../../components/ui/Badge";
import type { ProductionPlan } from "../types";
import {
  getProductionStatusLabel,
  getProductionStatusTone,
} from "../utils";

type Props = {
  plan: ProductionPlan;
};

export default function ProductionTodayHeader({ plan }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      {plan.deducted ? <Badge tone="completed">หักของแล้ว</Badge> : null}
      <Badge tone={getProductionStatusTone(plan.status)}>
        {getProductionStatusLabel(plan.status)}
      </Badge>
    </div>
  );
}
