import Skeleton from "../ui/Skeleton";
import Card from "../ui/Card";

/** Mobile-first loading skeleton for Opening Assets / Budget */
export default function BiListSkeleton({
  rows = 4,
  showSummary = true,
}: {
  rows?: number;
  showSummary?: boolean;
}) {
  return (
    <div className="space-y-3" aria-busy aria-label="กำลังโหลด">
      {showSummary ? (
        <Card className="space-y-3 !p-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      ) : null}
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="space-y-2 !p-4">
          <Skeleton className="h-5 w-3/4 max-w-[14rem]" />
          <Skeleton className="h-3 w-1/2 max-w-[10rem]" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}
