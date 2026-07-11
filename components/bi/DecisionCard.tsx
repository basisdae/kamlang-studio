import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { formatBaht } from "../../app/opening/sampleData";
import {
  DECISION_PRIORITY_LABELS,
  type DecisionItem,
} from "../../app/decisions/sampleData";

type DecisionCardProps = {
  decision: DecisionItem;
  highlight?: boolean;
};

export default function DecisionCard({
  decision,
  highlight = false,
}: DecisionCardProps) {
  return (
    <Card
      className={`space-y-3 ${
        highlight ? "!border-[var(--bi-lemon)] !bg-[rgb(231_246_91/0.18)]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="kl-type-card-title leading-snug">{decision.title}</h3>
          <p className="kl-type-helper mt-1">
            Deadline {decision.deadlineLabel} · {decision.owner}
          </p>
        </div>
        <span className="shrink-0 rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-1 kl-type-caption">
          {DECISION_PRIORITY_LABELS[decision.priority]}
        </span>
      </div>

      <div>
        <p className="kl-type-label">ผลกระทบ</p>
        <p className="kl-type-body mt-1">{decision.impact}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="kl-type-label">งบประมาณ</p>
          <p className="kl-type-body mt-1">{decision.budgetLabel}</p>
          <p className="kl-type-metric mt-0.5 text-[length:var(--kl-type-body-size)]">
            {decision.budgetAmount != null
              ? formatBaht(decision.budgetAmount)
              : "ยังไม่มีราคา"}
          </p>
        </div>
        <div>
          <p className="kl-type-label">Action</p>
          <p className="kl-type-body mt-1">{decision.action}</p>
        </div>
      </div>

      <Link
        href={decision.href}
        className="kl-btn kl-btn-primary flex w-full min-h-[2.75rem] items-center justify-center gap-2 kl-pressable"
      >
        <span>ไปตัดสินใจ</span>
        <ArrowRight className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      </Link>
    </Card>
  );
}
