import Badge from "../../../components/ui/Badge";
import type { ProductionPlan } from "../types";

type Props = {
  plan: ProductionPlan;
};

export default function ProductionTodayHeader({ plan }: Props) {
  if (!plan.deducted) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <Badge tone="completed">ตัดของแล้ว</Badge>
    </div>
  );
}
