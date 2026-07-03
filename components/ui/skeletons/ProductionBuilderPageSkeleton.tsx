import Card from "../Card";
import Skeleton from "../Skeleton";
import BuilderBottomBarSkeleton from "./BuilderBottomBarSkeleton";
import SkeletonField from "./SkeletonField";

export default function ProductionBuilderPageSkeleton() {
  return (
    <>
      <div
        className="space-y-7 kl-builder-scroll"
        aria-busy="true"
        aria-label="กำลังโหลดแผนวันนี้"
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
              className="kl-nested-panel space-y-3"
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
              <Skeleton key={index} className="h-14 w-full rounded-[var(--kl-radius-inner)]" />
            ))}
          </div>
        </Card>
      </div>

      <BuilderBottomBarSkeleton metricSlots={3} />
    </>
  );
}
