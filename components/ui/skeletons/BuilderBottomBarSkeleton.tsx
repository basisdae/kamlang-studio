import Skeleton from "../Skeleton";

type Props = {
  metricSlots?: number;
};

export default function BuilderBottomBarSkeleton({ metricSlots = 3 }: Props) {
  return (
    <div
      className="fixed inset-x-0 kl-bottom-bar z-40 bg-kl-ivory/95 px-4 pb-4 pt-3 backdrop-blur"
      aria-hidden
    >
      <div className="kl-action-bar-inner kl-card space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: metricSlots }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="mx-auto h-3 w-14" />
              <Skeleton className="h-5 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-12 w-full rounded-[var(--kl-radius-btn)]" />
      </div>
    </div>
  );
}
