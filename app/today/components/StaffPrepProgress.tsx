import { PRODUCTION_UI } from "../../production/copy";

type Props = {
  preparedCount: number;
  remainingCount: number;
  totalCount: number;
};

export default function StaffPrepProgress({
  preparedCount,
  remainingCount,
  totalCount,
}: Props) {
  const progressPercent =
    totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;

  return (
    <div className="kl-section space-y-5">
      <div className="kl-stat-pair">
        <div className="kl-stat">
          <div className="kl-caption">{PRODUCTION_UI.progress.done}</div>
          <div className="kl-stat-value">{preparedCount}</div>
        </div>
        <div className="kl-stat">
          <div className="kl-caption">{PRODUCTION_UI.progress.remaining}</div>
          <div className="kl-stat-value">{remainingCount}</div>
        </div>
      </div>

      <div className="kl-progress-track">
        <div
          className="kl-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
