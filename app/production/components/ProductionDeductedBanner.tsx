"use client";

import Card from "../../../components/ui/Card";
import { formatProductionDate } from "../utils";
import type { ProductionPlan } from "../types";

type Props = {
  plan: ProductionPlan;
};

function formatDeductedAt(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ProductionDeductedBanner({ plan }: Props) {
  if (!plan.deducted) return null;

  return (
    <Card className="rounded-2xl bg-kl-surface px-4 py-3">
      <div className="kl-type-card-title">หักของแล้ว</div>
      <div className="kl-type-caption mt-1 text-kl-muted">
        {plan.deductedAt
          ? `หักของเมื่อ ${formatDeductedAt(plan.deductedAt)}`
          : "แผนนี้หักของในครัวไปแล้ว"}
      </div>
    </Card>
  );
}
