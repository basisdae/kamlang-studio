"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "../ui/Card";
import SummaryMetric from "./SummaryMetric";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { formatBaht } from "../../app/opening/sampleData";
import type { OpeningSummary } from "../../app/opening/lib/openingDomain";

type Props = {
  summary: OpeningSummary;
  verdict: string;
  ctaHref: string;
  ctaLabel?: string;
};

/**
 * Opening Hub hero — glanceable in ~30s:
 * Progress ring · พร้อมแล้ว % · เหลืออีก · งบที่ต้องจัดหา · CTA
 */
export default function OpeningHeroCard({
  summary,
  verdict,
  ctaHref,
  ctaLabel = "ไปทำต่อ",
}: Props) {
  const pct = Math.max(0, Math.min(100, summary.readyPercent));
  const size = 120;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="space-y-4 !p-4">
      <div className="space-y-1">
        <p className="kl-type-label">พร้อมเปิดหรือยัง</p>
        <p className="kl-type-card-title leading-snug">{verdict}</p>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div
          className="relative shrink-0"
          role="img"
          aria-label={`พร้อมแล้ว ${pct} เปอร์เซ็นต์`}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--bi-surface-muted)"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--bi-lemon)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="kl-type-metric-lg tabular-nums leading-none">{pct}%</p>
            <p className="kl-type-caption mt-1">พร้อมแล้ว</p>
          </div>
        </div>

        <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex-1">
          <SummaryMetric
            label="เหลืออีก"
            value={`${summary.remainingCount}`}
            hint="รายการ"
            className="!px-3 !py-3"
          />
          <SummaryMetric
            label="งบที่ต้องจัดหา"
            value={formatBaht(summary.moneyNeeded)}
            hint={
              summary.noPriceCount > 0
                ? `ยังไม่มีราคา ${summary.noPriceCount}`
                : "จากรายการค้าง"
            }
            className="!px-3 !py-3"
          />
        </div>
      </div>

      <p className="kl-type-caption text-center sm:text-left">
        พร้อม {summary.readyCount}/{summary.totalCount} รายการ
      </p>

      <Link
        href={ctaHref}
        className="kl-btn kl-btn-primary flex w-full min-h-[2.75rem] items-center justify-center gap-2 kl-pressable"
      >
        <span>{ctaLabel}</span>
        <ArrowRight className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      </Link>
    </Card>
  );
}
