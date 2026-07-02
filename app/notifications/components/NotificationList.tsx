import { CheckCircle2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../copy/emptyStates";
import type { KlNotification } from "../types";
import NotificationCard from "./NotificationCard";

type Props = {
  notifications: KlNotification[];
};

export default function NotificationList({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        {...EMPTY_STATE.notifications.clear}
        icon={CheckCircle2}
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
