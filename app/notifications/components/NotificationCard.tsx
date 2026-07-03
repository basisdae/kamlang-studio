import Link from "next/link";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import type { KlNotification, NotificationType } from "../types";

type Props = {
  notification: KlNotification;
};

const typeLabel: Record<NotificationType, string> = {
  inventory_low: "ของใกล้หมด",
  inventory_out: "ของหมด",
  production_missing: "แผนวันนี้",
  purchase_incomplete: "ซื้อของ",
  backup_reminder: "เก็บข้อมูลไว้",
};

const typeTone: Record<
  NotificationType,
  "critical" | "draft" | "inProgress" | "neutral"
> = {
  inventory_low: "draft",
  inventory_out: "critical",
  production_missing: "inProgress",
  purchase_incomplete: "draft",
  backup_reminder: "neutral",
};

export default function NotificationCard({ notification }: Props) {
  return (
    <Link href={notification.href} className="block kl-pressable">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <Badge tone={typeTone[notification.type]}>
            {typeLabel[notification.type]}
          </Badge>
        </div>

        <div className="kl-notification-entry">
          <h2 className="kl-type-card-title">{notification.title}</h2>
          <p className="kl-type-description mt-1.5">{notification.message}</p>
        </div>
      </Card>
    </Link>
  );
}
