import { Check, Circle } from "lucide-react";
import Link from "next/link";
import AppShell from "../../../components/layout/AppShell";
import DataSourceBadge from "../../../components/bi/DataSourceBadge";
import MetricCard from "../../../components/bi/MetricCard";
import NextStepCard from "../../../components/bi/NextStepCard";
import SectionHeader from "../../../components/bi/SectionHeader";
import Card from "../../../components/ui/Card";
import ButtonLink from "../../../components/ui/ButtonLink";
import { OPENING_DATA_SOURCE } from "../../../components/bi/dataSource";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import {
  getChecklistProgress,
  OPENING_CHECKLIST,
} from "../sampleData";

const CHECKLIST_LINKS: Record<string, string> = {
  c2: "/opening/assets",
  c3: "/opening/assets",
  c4: "/opening/initial-stock",
  c5: "/opening/assets",
  c6: "/opening",
  c7: "/opening/team",
};

export default function OpeningChecklistPage() {
  const progress = getChecklistProgress();
  const nextItem = OPENING_CHECKLIST.find((item) => !item.done);
  const percent = Math.round((progress.done / progress.total) * 100);

  return (
    <AppShell title="รายการตรวจสอบ" backHref="/opening" compact>
      <DataSourceBadge source={OPENING_DATA_SOURCE} />

      <section className="space-y-3">
        <SectionHeader title="ภาพรวม" />
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="เสร็จแล้ว"
            value={`${progress.done}/${progress.total}`}
          />
          <MetricCard label="ความคืบหน้า" value={`${percent}%`} />
        </div>
        <div
          className="kl-progress-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="kl-progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </section>

      <NextStepCard
        message={
          nextItem
            ? `ทำต่อ: “${nextItem.label}” — ยังไม่พร้อมเปิดร้าน`
            : "รายการตรวจสอบครบแล้ว — พร้อมสรุปกับทีมบริหาร"
        }
        href={
          nextItem
            ? CHECKLIST_LINKS[nextItem.id] ?? "/opening"
            : "/opening/team"
        }
        actionLabel={nextItem ? "ไปทำรายการนี้" : "ไปทีมบริหาร"}
      />

      <section className="space-y-3">
        <SectionHeader title="รายละเอียด" />
        <Card className="space-y-1 !p-2">
          {OPENING_CHECKLIST.map((item) => {
            const href = CHECKLIST_LINKS[item.id];
            const row = (
              <div className="flex min-h-[2.75rem] items-center gap-3 rounded-[var(--kl-radius-inner)] px-3">
                {item.done ? (
                  <Check
                    className={`${KL_ICON_CLASS} text-[var(--bi-success)]`}
                    strokeWidth={KL_ICON_STROKE}
                  />
                ) : (
                  <Circle
                    className={`${KL_ICON_CLASS} text-kl-muted`}
                    strokeWidth={KL_ICON_STROKE}
                  />
                )}
                <span
                  className={`kl-type-body ${
                    item.done ? "text-kl-muted line-through" : ""
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );

            if (!item.done && href) {
              return (
                <Link key={item.id} href={href} className="block kl-pressable">
                  {row}
                </Link>
              );
            }

            return <div key={item.id}>{row}</div>;
          })}
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Action" />
        <ButtonLink href="/opening/assets" fullWidth>
          ไปทรัพย์สิน
        </ButtonLink>
        <ButtonLink href="/opening" variant="secondary" fullWidth>
          กลับแผนเปิดร้าน
        </ButtonLink>
      </section>
    </AppShell>
  );
}
