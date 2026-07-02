import Skeleton from "../Skeleton";

export default function FileUploadZoneSkeleton() {
  return (
    <div
      className="flex w-full flex-col items-center justify-center gap-2"
      aria-busy="true"
      aria-label="กำลังตรวจสอบไฟล์"
    >
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}
