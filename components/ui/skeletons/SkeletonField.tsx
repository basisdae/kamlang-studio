import Skeleton from "../Skeleton";

export default function SkeletonField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-12 w-full rounded-[var(--kl-radius-btn)]" />
    </div>
  );
}
