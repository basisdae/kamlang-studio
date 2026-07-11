import Card from "../ui/Card";
import {
  CALENDAR_PRIORITY_LABELS,
  CALENDAR_STATUS_LABELS,
  type OpeningCalendarTask,
} from "../../app/opening/calendar/sampleData";

type OpeningCalendarTaskCardProps = {
  task: OpeningCalendarTask;
  isLast?: boolean;
};

/** Vertical timeline node — day · task · deadline · status · priority */
export default function OpeningCalendarTaskCard({
  task,
  isLast = false,
}: OpeningCalendarTaskCardProps) {
  return (
    <div className="flex gap-3">
      <div className="flex w-4 shrink-0 flex-col items-center">
        <span
          className={`mt-4 h-3 w-3 shrink-0 rounded-full ${dotClass(task)}`}
          aria-hidden
        />
        {!isLast ? (
          <span className="mt-1 w-px flex-1 bg-[var(--kl-border)]" aria-hidden />
        ) : null}
      </div>

      <Card className={`min-w-0 flex-1 space-y-3 !p-3.5 ${isLast ? "" : "mb-3"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="kl-type-caption">{task.dayLabel}</p>
            <h3 className="kl-type-card-title mt-1 leading-snug">{task.task}</h3>
          </div>
          <span
            className={`shrink-0 rounded-[var(--kl-radius-inner)] px-2 py-1 kl-type-caption ${statusClass(task)}`}
          >
            {CALENDAR_STATUS_LABELS[task.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="kl-type-label">Deadline</p>
            <p className="kl-type-body mt-1">{task.deadlineLabel}</p>
          </div>
          <div>
            <p className="kl-type-label">Priority</p>
            <p className="kl-type-body mt-1">
              {CALENDAR_PRIORITY_LABELS[task.priority]}
            </p>
          </div>
        </div>

        <p className="kl-type-helper">
          <span className="text-kl-muted">ผู้รับผิดชอบ</span> {task.owner}
        </p>
      </Card>
    </div>
  );
}

function statusClass(task: OpeningCalendarTask) {
  switch (task.status) {
    case "done":
      return "bg-[rgb(231_246_91/0.55)] text-[var(--bi-text-primary)]";
    case "in_progress":
      return "bg-kl-surface text-[var(--bi-text-primary)]";
    case "overdue":
      return "bg-[rgb(255_100_100/0.15)] text-[var(--bi-text-primary)]";
    default:
      return "bg-kl-surface text-kl-muted";
  }
}

function dotClass(task: OpeningCalendarTask) {
  switch (task.status) {
    case "done":
      return "bg-[var(--bi-lemon)]";
    case "in_progress":
      return "bg-[var(--bi-text-primary)]";
    case "overdue":
      return "bg-[rgb(220_80_80)]";
    default:
      return "bg-[var(--kl-border)]";
  }
}
