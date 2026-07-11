"use client";

import Link from "next/link";
import Card from "../ui/Card";
import PriorityBadge from "./PriorityBadge";
import StatusChip from "./StatusChip";
import {
  formatBaht,
  getBudgetLineTotal,
  getDecisionGroupBudgetViews,
  type BudgetItem,
} from "../../app/opening/sampleData";
import { useAssets } from "../../app/opening/assets/AssetsProvider";

export default function BudgetItemCard({ item }: { item: BudgetItem }) {
  const { assets, decisionGroups } = useAssets();
  const total = getBudgetLineTotal(item);
  const posGroup = item.decisionGroupId
    ? getDecisionGroupBudgetViews(assets, decisionGroups).find(
        (v) => v.group.id === item.decisionGroupId
      )
    : null;

  const detailHref = item.decisionGroupId
    ? `/opening/assets/${posGroup?.cheapest?.id ?? posGroup?.options[0]?.id ?? ""}`
    : item.assetId
      ? `/opening/assets/${item.assetId}`
      : null;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="kl-type-card-title">{item.name}</h3>
          <p className="kl-type-helper mt-1">{item.category}</p>
        </div>
        <PriorityBadge priority={item.priority} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={item.status} />
        <span className="kl-type-caption">× {item.quantity}</span>
      </div>

      {posGroup ? (
        <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface p-3 space-y-2">
          <p className="kl-type-caption font-medium">เลือกได้ 1 ตัว · Decision group</p>
          <p className="kl-type-body">
            {posGroup.undecided
              ? "ยังไม่ตัดสินใจ"
              : `เลือกแล้ว: ${posGroup.selected?.name}`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="kl-type-label">งบต่ำสุด</p>
              <p className="kl-type-body mt-1">
                {formatBaht(posGroup.minAmount)}
              </p>
            </div>
            <div>
              <p className="kl-type-label">งบสูงสุด</p>
              <p className="kl-type-body mt-1">
                {formatBaht(posGroup.maxAmount)}
              </p>
            </div>
          </div>
          <ul className="space-y-1">
            {posGroup.options.map((opt) => (
              <li key={opt.id}>
                <Link
                  href={`/opening/assets/${opt.id}`}
                  className="kl-type-caption text-[var(--bi-text-primary)] underline"
                >
                  {opt.name} ·{" "}
                  {opt.estimatedPrice != null
                    ? formatBaht(opt.estimatedPrice)
                    : "—"}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="kl-type-label">ราคาประเมิน</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {item.estimatedPrice != null
                ? formatBaht(item.estimatedPrice)
                : "—"}
            </p>
          </div>
          <div>
            <p className="kl-type-label">ราคาจริง</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {item.actualPrice != null ? formatBaht(item.actualPrice) : "—"}
            </p>
          </div>
        </div>
      )}

      {!posGroup ? (
        <div className="border-t border-[var(--kl-border)] pt-3">
          <p className="kl-type-label">ยอดรวม</p>
          <p className="kl-type-metric mt-1">
            {total != null ? formatBaht(total) : "ยังไม่ทราบ"}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {detailHref ? (
          <Link
            href={detailHref}
            className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline-offset-2 kl-pressable"
          >
            ดูทรัพย์สิน →
          </Link>
        ) : null}
        <Link
          href="/opening/documents"
          className="kl-type-caption font-medium text-[var(--bi-text-primary)] underline-offset-2 kl-pressable"
        >
          เอกสาร · ใบเสนอราคา →
        </Link>
      </div>
    </Card>
  );
}
