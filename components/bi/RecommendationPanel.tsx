"use client";

import { useMemo } from "react";
import SectionHeader from "./SectionHeader";
import EmptyState from "../ui/EmptyState";
import RecommendationCard from "./RecommendationCard";
import {
  buildRecommendations,
  type Recommendation,
} from "../../app/opening/lib/recommendationEngine";
import type { AssetItem } from "../../data/seed/tangtao";

type Props = {
  assets: AssetItem[];
  limit?: number;
  title?: string;
};

/**
 * Rule-based recommendations panel — Missing · Related · Supplier · Knowledge.
 */
export default function RecommendationPanel({
  assets,
  limit = 6,
  title = "แนะนำสิ่งที่ยังขาด",
}: Props) {
  const items = useMemo(
    () => buildRecommendations(assets, limit),
    [assets, limit]
  );

  return (
    <section className="space-y-3" aria-label={title}>
      <SectionHeader title={title} />
      <p className="kl-type-helper -mt-1">
        Rule-based · ยังไม่ใช้ AI · จากรายการเตรียมเปิดร้านชุดเดียว
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="ยังไม่มีคำแนะนำเพิ่ม"
          hint="รายการหลักครบตามกฎแล้ว — ตรวจทีมและเอกสารต่อได้"
          actionLabel="ไปรายการเตรียมเปิดร้าน"
          actionHref="/opening/checklist"
        />
      ) : (
        <div className="space-y-2">
          {items.map((item: Recommendation) => (
            <RecommendationCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
