import Card from "../Card";
import Skeleton from "../Skeleton";
import BuilderBottomBarSkeleton from "./BuilderBottomBarSkeleton";
import SkeletonField from "./SkeletonField";

export default function ProductionBuilderPageSkeleton() {
  return (
    <>
      <div
        className="space-y-7 pb-44"
        aria-busy="true"
        aria-label="กำลังโหลดแผนผลิต"
      >
        <Card className="space-y-4">
          <SkeletonField />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-9 w-28 rounded-[var(--kl-radius-btn)]" />
          </div>

          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-kl-border bg-kl-surface p-4"
            >
              <Skeleton className="h-3.5 w-20" />
              <SkeletonField />
              <SkeletonField />
            </div>
          ))}
        </Card>

        <Card>
          <div className="kl-metric-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        </Card>
      </div>

      <BuilderBottomBarSkeleton metricSlots={3} />
    </>
  );
}
