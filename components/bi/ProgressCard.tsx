import Card from "../ui/Card";

type ProgressCardProps = {
  label: string;
  percent: number;
  detail?: string;
};

export default function ProgressCard({
  label,
  percent,
  detail,
}: ProgressCardProps) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="kl-type-label">{label}</p>
        <p className="kl-type-metric text-[length:var(--kl-type-body-size)]">
          {clamped}%
        </p>
      </div>
      <div
        className="kl-progress-track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="kl-progress-fill"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {detail ? <p className="kl-type-helper">{detail}</p> : null}
    </Card>
  );
}
