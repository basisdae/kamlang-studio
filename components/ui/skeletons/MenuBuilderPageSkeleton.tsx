import Card from "../Card";
import Skeleton from "../Skeleton";
import BuilderBottomBarSkeleton from "./BuilderBottomBarSkeleton";
import SkeletonField from "./SkeletonField";

export default function MenuBuilderPageSkeleton() {
  return (
    <>
      <div
        className="space-y-4 kl-builder-scroll"
        aria-busy="true"
        aria-label="กำลังโหลดเมนูขาย"
      >
        <Card>
          <Skeleton className="h-11 w-full rounded-[var(--kl-radius-btn)]" />
        </Card>

        <Card className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonField key={index} />
          ))}
        </Card>
      </div>

      <BuilderBottomBarSkeleton metricSlots={6} />
    </>
  );
}
