"use client";

import SummaryCard from "../../../../components/bi/SummaryCard";
import { formatBaht } from "../../sampleData";
import {
  smartBudgetDisclaimer,
  type SmartBudgetReport,
} from "../../lib/smartBudget";

type Props = {
  report: SmartBudgetReport;
};

export default function SmartBudgetWaterfall({ report }: Props) {
  const max = Math.max(
    report.estimatedTotal,
    report.actualTotal,
    report.needTotal,
    Math.abs(report.difference),
    1
  );

  return (
    <SummaryCard title="Waterfall Summary">
      <p className="kl-type-caption -mt-2">{smartBudgetDisclaimer()}</p>
      <div className="space-y-3">
        {report.waterfall.map((step) => {
          const width = Math.min(100, (Math.abs(step.amount) / max) * 100);
          const isNeg = step.kind === "diff" && step.amount < 0;
          return (
            <div key={step.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="kl-type-label">{step.label}</p>
                <p
                  className={`kl-type-body tabular-nums ${
                    isNeg ? "text-kl-danger-text" : ""
                  }`}
                >
                  {step.kind === "diff" && step.amount > 0 ? "+" : ""}
                  {formatBaht(step.amount)}
                </p>
              </div>
              <div className="kl-progress-track">
                <div
                  className={`kl-progress-fill ${
                    step.kind === "need"
                      ? "!bg-[var(--bi-surface-muted)]"
                      : ""
                  }`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </SummaryCard>
  );
}
