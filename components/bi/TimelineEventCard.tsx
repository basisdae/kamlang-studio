import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  CheckSquare,
  FileText,
  PackagePlus,
  ShoppingBag,
  UserPlus,
  Wallet,
} from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import {
  formatEventTime,
  type TimelineEvent,
  type TimelineEventKind,
} from "../../app/timeline/sampleData";

const KIND_ICON: Record<TimelineEventKind, LucideIcon> = {
  budget_added: Wallet,
  asset_added: PackagePlus,
  purchased: ShoppingBag,
  quote: FileText,
  checklist: CheckSquare,
  partner_added: UserPlus,
};

type TimelineEventCardProps = {
  event: TimelineEvent;
};

export default function TimelineEventCard({ event }: TimelineEventCardProps) {
  const Icon = KIND_ICON[event.kind];

  return (
    <Link href={event.href} className="block kl-pressable">
      <Card className="flex gap-3 !p-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.45)]"
          aria-hidden
        >
          <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="kl-type-card-title leading-snug">{event.action}</p>
            <time
              dateTime={event.at}
              className="kl-type-caption shrink-0 tabular-nums"
            >
              {formatEventTime(event.at)}
            </time>
          </div>

          <p className="kl-type-body truncate">{event.item}</p>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
            <p className="kl-type-helper">
              <span className="text-kl-muted">หมวด</span> {event.category}
            </p>
            <p className="kl-type-helper">
              <span className="text-kl-muted">ผู้ทำ</span> {event.person}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
