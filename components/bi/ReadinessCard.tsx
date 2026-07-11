import Link from "next/link";
import Card from "../ui/Card";
import {
  READINESS_STATUS_LABELS,
  type ReadinessArea,
  type ReadinessStatus,
} from "../../app/opening/sampleData";

type ReadinessCardProps = {
  area: ReadinessArea;
};

export default function ReadinessCard({ area }: ReadinessCardProps) {
  return (
    <Link href={area.href} className="block kl-pressable">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="kl-type-card-title">{area.title}</h3>
            <p className="kl-type-helper mt-1">{area.hint}</p>
          </div>
          <span
            className={`shrink-0 rounded-[var(--kl-radius-inner)] px-2 py-1 kl-type-caption ${statusTone(area.status)}`}
          >
            {READINESS_STATUS_LABELS[area.status]}
          </span>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="kl-type-label">ความพร้อม</p>
            <p className="kl-type-metric mt-1">{area.percent}%</p>
          </div>
          <div className="min-w-[7rem] flex-1">
            <div className="kl-progress-track">
              <div
                className="kl-progress-fill"
                style={{ width: `${area.percent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function statusTone(status: ReadinessStatus) {
  switch (status) {
    case "ready":
      return "bg-[rgb(231_246_91/0.55)] text-[var(--bi-text-primary)]";
    case "blocked":
      return "bg-[rgb(255_100_100/0.15)] text-[var(--bi-text-primary)]";
    default:
      return "bg-kl-surface text-kl-muted";
  }
}
