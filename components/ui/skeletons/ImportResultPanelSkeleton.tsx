import Card from "../Card";
import SectionTitle from "../SectionTitle";
import Skeleton from "../Skeleton";

export default function ImportResultPanelSkeleton() {
  return (
    <section className="space-y-3" aria-busy="true" aria-label="กำลังตรวจสอบไฟล์">
      <SectionTitle>ผลการตรวจสอบ</SectionTitle>

      <Card className="space-y-4">
        <div className="kl-metric-grid">
          <div className="space-y-2">
            <Skeleton className="mx-auto h-3 w-20" />
            <Skeleton className="mx-auto h-8 w-12" />
          </div>
          <div className="space-y-2">
            <Skeleton className="mx-auto h-3 w-20" />
            <Skeleton className="mx-auto h-8 w-12" />
          </div>
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-[var(--kl-radius-btn)]" />
          <Skeleton className="h-10 w-full rounded-[var(--kl-radius-btn)]" />
        </div>
      </Card>
    </section>
  );
}
