import Card from "../ui/Card";
import Skeleton from "../ui/Skeleton";

/** Hub loading — one skeleton per card section */
export default function OpeningHubSkeleton() {
  return (
    <div className="space-y-3" aria-busy aria-label="กำลังโหลดภาพรวมเปิดร้าน">
      {/* Hero */}
      <Card className="space-y-4 !p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-3/4 max-w-[16rem]" />
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Skeleton className="h-[7.5rem] w-[7.5rem] !rounded-full" />
          <div className="grid w-full grid-cols-2 gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
        <Skeleton className="h-11 w-full" />
      </Card>

      {/* Next step */}
      <Card className="space-y-3 !p-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-11 w-full" />
      </Card>

      {/* Checklist preview */}
      <Card className="space-y-3 !p-4">
        <Skeleton className="h-4 w-36" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4 max-w-[12rem]" />
              <Skeleton className="h-3 w-1/2 max-w-[8rem]" />
            </div>
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </Card>

      {/* Recent activity */}
      <Card className="space-y-3 !p-4">
        <Skeleton className="h-4 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-full max-w-[14rem]" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
}
