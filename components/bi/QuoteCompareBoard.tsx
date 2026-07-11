"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "../ui/Card";
import { formatBaht } from "../../app/opening/sampleData";
import {
  QUOTE_PICK_LABELS,
  QUOTE_PICK_TAGS,
  type QuoteCompareGroup,
  type QuotePickTag,
} from "../../app/quotes/sampleData";

type Picks = Partial<Record<QuotePickTag, string>>;

type QuoteCompareBoardProps = {
  group: QuoteCompareGroup;
};

/**
 * Quote compare UI — pick Best Price / Best Value / Recommended.
 * No scoring math yet.
 */
export default function QuoteCompareBoard({ group }: QuoteCompareBoardProps) {
  const [picks, setPicks] = useState<Picks>({});

  function assignTag(optionId: string, tag: QuotePickTag) {
    setPicks((prev) => {
      if (prev[tag] === optionId) {
        const next = { ...prev };
        delete next[tag];
        return next;
      }
      return { ...prev, [tag]: optionId };
    });
  }

  function tagsFor(optionId: string): QuotePickTag[] {
    return QUOTE_PICK_TAGS.filter((tag) => picks[tag] === optionId);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="kl-type-section-title">{group.itemName}</h3>
        <Link
          href={group.href}
          className="kl-type-caption font-medium text-[var(--bi-text-primary)] kl-pressable"
        >
          ดูทรัพย์สิน →
        </Link>
      </div>

      <p className="kl-type-helper">
        แตะป้ายเพื่อเลือก · ยังไม่คำนวณอัตโนมัติ
      </p>

      <div className="space-y-3">
        {group.options.map((option) => {
          const activeTags = tagsFor(option.id);
          return (
            <Card
              key={option.id}
              className={`space-y-3 ${
                activeTags.length > 0
                  ? "!border-[var(--bi-lemon)] !bg-[rgb(231_246_91/0.14)]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="kl-type-card-title">{option.vendor}</p>
                  {option.note ? (
                    <p className="kl-type-helper mt-1">{option.note}</p>
                  ) : null}
                </div>
                <p className="kl-type-metric shrink-0 text-[length:var(--kl-type-body-size)]">
                  {formatBaht(option.amount)}
                </p>
              </div>

              {activeTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {activeTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.55)] px-2 py-1 kl-type-caption text-[var(--bi-text-primary)]"
                    >
                      {QUOTE_PICK_LABELS[tag]}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {QUOTE_PICK_TAGS.map((tag) => {
                  const active = picks[tag] === option.id;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => assignTag(option.id, tag)}
                      className={`kl-segment-btn shrink-0 kl-pressable ${
                        active
                          ? "bg-[var(--bi-lemon)] text-[var(--bi-text-primary)]"
                          : "bg-kl-surface text-kl-muted"
                      }`}
                    >
                      {QUOTE_PICK_LABELS[tag]}
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="space-y-2 !p-4">
        <p className="kl-type-label">สรุปการเลือก (UI)</p>
        {QUOTE_PICK_TAGS.map((tag) => {
          const optionId = picks[tag];
          const option = group.options.find((o) => o.id === optionId);
          return (
            <p key={tag} className="kl-type-body">
              {QUOTE_PICK_LABELS[tag]}:{" "}
              {option
                ? `${option.vendor} · ${formatBaht(option.amount)}`
                : "ยังไม่เลือก"}
            </p>
          );
        })}
      </Card>
    </div>
  );
}
