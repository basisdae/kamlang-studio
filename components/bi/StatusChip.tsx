import type { BadgeTone } from "../ui/Badge";
import Badge from "../ui/Badge";
import type { BudgetStatus } from "../../app/opening/sampleData";
import { STATUS_LABELS } from "../../app/opening/sampleData";

const toneByStatus: Record<BudgetStatus, BadgeTone> = {
  no_price: "draft",
  comparing: "inProgress",
  ready_to_buy: "info",
  purchased: "ready",
  awaiting_delivery: "inProgress",
  received: "ready",
  installed: "completed",
};

export default function StatusChip({ status }: { status: BudgetStatus }) {
  return <Badge tone={toneByStatus[status]}>{STATUS_LABELS[status]}</Badge>;
}
