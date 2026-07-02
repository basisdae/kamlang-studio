import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../copy/emptyStates";
import type { ActivityLog } from "../types";
import { formatActivityTimestamp } from "../utils";

type Props = {
  activities: ActivityLog[];
};

export default function ActivityTimeline({ activities }: Props) {
  if (activities.length === 0) {
    return <EmptyState {...EMPTY_STATE.activity.none} />;
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <Card key={activity.id} className="relative space-y-2 pl-5">
          {index < activities.length - 1 ? (
            <span
              aria-hidden
              className="absolute bottom-0 left-[0.55rem] top-8 w-px bg-kl-border"
            />
          ) : null}

          <span
            aria-hidden
            className="absolute left-3 top-5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-kl-primary"
          />

          <div className="kl-caption">
            {formatActivityTimestamp(activity.createdAt)}
          </div>

          <p className="kl-type-body break-words font-medium">
            {activity.message}
          </p>
        </Card>
      ))}
    </div>
  );
}
