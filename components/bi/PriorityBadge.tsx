import type { BadgeTone } from "../ui/Badge";
import Badge from "../ui/Badge";
import type { BudgetPriority } from "../../app/opening/sampleData";
import { PRIORITY_LABELS } from "../../app/opening/sampleData";

const toneByPriority: Record<BudgetPriority, BadgeTone> = {
  must: "critical",
  should: "draft",
  nice: "neutral",
};

export default function PriorityBadge({
  priority,
}: {
  priority: BudgetPriority;
}) {
  return (
    <Badge tone={toneByPriority[priority]}>
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
