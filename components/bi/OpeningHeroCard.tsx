"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "../ui/Card";
import SummaryMetric from "./SummaryMetric";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import type { OpeningSummary } from "../../app/opening/lib/openingDomain";

type Props = {
  summary: OpeningSummary;
  verdict: string;
  ctaHref: string;
  ctaLabel?: string;
};

/**
 * Compact hub hero for ~390px first screen:
 * verdict · ring + metrics · CTA
 */
export default function OpeningHeroCard({
  summary,
  verdict,
  ctaHref,
  ctaLabel = "ไปทำต่อ",
}: Props) {
  const pct = Math.max(0, Math.min(100, summary.readyPercent));
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className="space-y-3 !p-3">
      <p className="kl-type-body font-medium leading-snug">{verdict}</p>

      <div className="flex items-center gap-3">
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
            <p className="kl-type-metric tabular-nums leading-none">{pct}%</p>
            <p className="kl-type-caption mt-0.5">พร้อม</p>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5">
          <SummaryMetric
            label="เหลืออีก"
            value={`${summary.remainingCount}`}
            hint={`${summary.readyCount}/${summary.totalCount} พร้อม`}
            tone={summary.remainingCount > 0 ? "accent" : "success"}
            className="!px-2 !py-1.5"
          />
          <SummaryMetric
            label="งบที่ต้องจัดหา"
            amount={summary.moneyNeeded}
            tone="accent"
            className="!px-2 !py-1.5"
          />
          {summary.noPriceCount > 0 ? (
            <SummaryMetric
              label="ยังไม่มีราคา"
              value={`${summary.noPriceCount} รายการ`}
              warning
              className="!px-2 !py-1.5"
            />
          ) : null}
        </div>
      </div>

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
