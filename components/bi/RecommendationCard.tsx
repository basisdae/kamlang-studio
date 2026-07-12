"use client";

import Link from "next/link";
import Card from "../ui/Card";
import {
  REC_KIND_LABELS,
  type Recommendation,
} from "../../app/opening/lib/recommendationEngine";

type Props = {
  item: Recommendation;
};

/**
 * Knowledge / suggestion card — link · note · warning (rule-based).
 */
export default function RecommendationCard({ item }: Props) {
  const isWarning = item.kind === "warning" || Boolean(item.warning);

  return (
    <Card
      className={`space-y-2 !p-3.5 ${
        isWarning ? "border border-[var(--bi-lemon)]" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-0.5 kl-type-caption">
          {REC_KIND_LABELS[item.kind]}
        </span>
        <p className="kl-type-card-title min-w-0 flex-1 leading-snug">
          {item.title}
        </p>
      </div>

      {item.note ? <p className="kl-type-helper">{item.note}</p> : null}

      {item.warning ? (
        <p className="kl-type-caption text-kl-danger-text" role="status">
          ⚠ {item.warning}
        </p>
      ) : null}

      <p className="kl-type-caption">เหตุผล: {item.reason}</p>

      {item.suggestSupplier ? (
        <p className="kl-type-caption">แนะนำร้าน: {item.suggestSupplier}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        {item.linkHref && item.linkLabel ? (
          <Link
            href={
              item.suggestName && item.linkHref?.includes("/assets/new")
                ? `${item.linkHref}?name=${encodeURIComponent(item.suggestName)}${
                    item.suggestCategory
                      ? `&category=${encodeURIComponent(item.suggestCategory)}`
                      : ""
                  }`
                : item.linkHref!
            }
            className="kl-btn kl-btn-primary inline-flex min-h-[2.5rem] items-center px-3 kl-pressable"
          >
            {item.linkLabel}
          </Link>
        ) : null}
        {item.suggestName && !item.linkHref?.includes("/assets/new") ? (
          <Link
            href={`/opening/assets/new?name=${encodeURIComponent(item.suggestName)}${
              item.suggestCategory
                ? `&category=${encodeURIComponent(item.suggestCategory)}`
                : ""
            }`}
            className="kl-btn kl-btn-secondary inline-flex min-h-[2.5rem] items-center px-3 kl-pressable"
          >
            + เพิ่ม “{item.suggestName}”
          </Link>
        ) : null}
      </div>
    </Card>
  );
}
