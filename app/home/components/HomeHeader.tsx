import HomeNotificationBadge from "./HomeNotificationBadge";

type Props = {
  dateLabel: string;
  notificationCount: number;
};

export default function HomeHeader({ dateLabel, notificationCount }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="kl-type-label text-kl-muted">{dateLabel}</p>
      {notificationCount > 0 ? (
        <HomeNotificationBadge count={notificationCount} />
      ) : null}
    </div>
  );
}
