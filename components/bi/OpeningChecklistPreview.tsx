"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import SectionHeader from "./SectionHeader";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import {
  ASSET_STATUS_LABELS,
  assetHasNoPrice,
  type AssetItem,
} from "../../data/seed/tangtao";
import { uxStatusLabel } from "../../app/opening/lib/openingDomain";

type Props = {
  items: AssetItem[];
  totalRemaining: number;
};

/**
 * First 5 attention items — same bi_assets as Checklist.
 */
export default function OpeningChecklistPreview({
  items,
  totalRemaining,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <SectionHeader title="รายการที่ต้องทำต่อ" />
        <Link
          href="/opening/checklist"
          className="kl-type-caption shrink-0 underline text-[var(--bi-text-primary)]"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="เคลียร์รายการหลักแล้ว"
          hint="ตรวจทีมและเอกสารก่อนเปิดร้าน"
          actionLabel="ไปรายการเตรียมเปิดร้าน"
          actionHref="/opening/checklist"
        />
      ) : (
        <Card className="!overflow-hidden !p-0">
          {items.map((item) => (
            <Link
              key={item.id}
              href={
                assetHasNoPrice(item)
                  ? `/opening/assets/${item.id}/edit`
                  : `/opening/assets/${item.id}`
              }
              className="flex min-h-[2.75rem] items-center justify-between gap-3 border-b border-[var(--kl-border)] px-3 py-2.5 last:border-b-0 kl-pressable"
            >
              <div className="min-w-0">
                <p className="kl-type-body truncate font-medium">{item.name}</p>
                <p className="kl-type-caption mt-0.5 truncate">
                  {item.category}
                  {assetHasNoPrice(item) ? " · ยังไม่ใส่ราคา" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="kl-type-caption">
                  {assetHasNoPrice(item)
                    ? "ใส่ราคา"
                    : uxStatusLabel(item.status) ||
                      ASSET_STATUS_LABELS[item.status]}
                </span>
                <ChevronRight
                  className={KL_ICON_CLASS}
                  strokeWidth={KL_ICON_STROKE}
                  aria-hidden
                />
              </div>
            </Link>
          ))}
          {totalRemaining > items.length ? (
            <p className="px-3 py-2 kl-type-caption text-center">
              และอีก {totalRemaining - items.length} รายการใน Checklist
            </p>
          ) : null}
        </Card>
      )}
    </section>
  );
}
