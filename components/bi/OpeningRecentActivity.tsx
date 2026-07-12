"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import SectionHeader from "./SectionHeader";
import { activityService } from "../../lib/services/activityService";
import type { ActivityLog } from "../../lib/types/activity";

type Props = {
  workspaceId: string;
  enabled: boolean;
};

/**
 * Recent Opening activity from bi_activity_logs (read-only, no schema change).
 */
export default function OpeningRecentActivity({
  workspaceId,
  enabled,
}: Props) {
  const [rows, setRows] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || !workspaceId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    void activityService
      .list(workspaceId, 5)
      .then((list) => {
        if (!cancelled) setRows(list);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, enabled]);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <SectionHeader title="กิจกรรมล่าสุด" />
        <Link
          href="/opening/activity"
          className="kl-type-caption shrink-0 underline text-[var(--bi-text-primary)]"
        >
          ดูทั้งหมด
        </Link>
      </div>

      {loading ? (
        <Card className="space-y-3 !p-4" aria-busy aria-label="กำลังโหลดกิจกรรม">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-full max-w-[14rem]" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </Card>
      ) : failed ? (
        <Card className="!p-4">
          <p className="kl-type-helper">โหลดกิจกรรมไม่สำเร็จ — ลองใหม่ภายหลัง</p>
        </Card>
      ) : rows.length === 0 ? (
        <EmptyState
          title="ยังไม่มีกิจกรรม"
          hint="เมื่อบันทึกหรือเปลี่ยนสถานะ รายการจะโผล่ที่นี่"
          actionLabel="+ เพิ่มรายการ"
          actionHref="/opening/assets/new"
        />
      ) : (
        <Card className="!overflow-hidden !p-0">
          {rows.map((row) => (
            <div
              key={row.id}
              className="border-b border-[var(--kl-border)] px-3 py-2.5 last:border-b-0"
            >
              <p className="kl-type-body leading-snug">{row.summary}</p>
              <p className="kl-type-caption mt-1">
                {row.actorName} · {formatActivityWhen(row.createdAt)}
              </p>
            </div>
          ))}
        </Card>
      )}
    </section>
  );
}

function formatActivityWhen(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม.ที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} วันที่แล้ว`;
  try {
    return new Date(t).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso.slice(0, 10);
  }
}
