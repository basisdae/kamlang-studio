"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../../components/layout/AppShell";
import BiDataStatus from "../../../components/bi/BiDataStatus";
import BiListSkeleton from "../../../components/bi/BiListSkeleton";
import PageHeader from "../../../components/bi/PageHeader";
import SectionHeader from "../../../components/bi/SectionHeader";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import SearchBar from "../../../components/ui/SearchBar";
import SegmentChip from "../../../components/ui/SegmentChip";
import ButtonLink from "../../../components/ui/ButtonLink";
import { useWorkspace } from "../../providers/WorkspaceProvider";
import { useAuth } from "../../auth/AuthProvider";
import { activityService } from "../../../lib/services/activityService";
import type { ActivityLog } from "../../../lib/types/activity";
import {
  getFavoriteIds,
  getPinnedIds,
  toggleFavorite,
  togglePin,
} from "../../../lib/bi/activityPrefs";
import {
  buildOpeningActivityNotifications,
  filterFeed,
  groupActivitiesByDay,
  sortFeed,
} from "../lib/workspaceActivity";
import ActivityDailySummary from "./components/ActivityDailySummary";
import WorkspaceActivityItem from "./components/WorkspaceActivityItem";
import { Suspense } from "react";

/**
 * Workspace Feed — bi_activity_logs + UI prefs (fav/pin/comment).
 */
function OpeningActivityInner() {
  const searchParams = useSearchParams();
  const actionFilter = searchParams.get("action") ?? "all";
  const {
    workspaceName,
    workspaceId,
    loading: wsLoading,
    configured,
    online,
    browserOffline,
    error: wsError,
    retry,
  } = useWorkspace();
  const { displayName, user } = useAuth();
  const author =
    displayName ?? user?.email?.split("@")[0] ?? "ผู้ใช้งาน";

  const [rows, setRows] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    if (!configured || !workspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await activityService.list(workspaceId, 100);
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "โหลดกิจกรรมไม่สำเร็จ");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [configured, workspaceId]);

  useEffect(() => {
    void load();
    setFavoriteIds(getFavoriteIds());
    setPinnedIds(getPinnedIds());
  }, [load]);

  const mentionHints = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.actorName).filter(Boolean))).slice(
        0,
        8
      ),
    [rows]
  );

  const filtered = useMemo(() => {
    const base = filterFeed(rows, {
      query,
      favoritesOnly,
      favoriteIds,
      action: actionFilter,
    });
    return sortFeed(base, pinnedIds);
  }, [rows, query, favoritesOnly, favoriteIds, actionFilter, pinnedIds]);

  const byDay = useMemo(() => groupActivitiesByDay(filtered), [filtered]);
  const dailyAll = useMemo(() => groupActivitiesByDay(rows), [rows]);
  const notifications = useMemo(
    () => buildOpeningActivityNotifications(rows),
    [rows]
  );

  const pageLoading = wsLoading || loading;
  const pageError = wsError ?? error;

  return (
    <AppShell title="" hidePageHeader compact backHref="/opening">
      <PageHeader
        title="เปิดร้าน"
        workspace={workspaceName}
        subtitle="กิจกรรม Workspace"
      />
      <p className="kl-type-helper -mt-1">
        ความเคลื่อนไหวจาก bi_activity_logs · Feed ของ Workspace
      </p>

      <BiDataStatus
        loading={pageLoading}
        ready={!wsLoading}
        configured={configured}
        online={online}
        browserOffline={browserOffline}
        error={pageError}
        empty={false}
        hasCachedData={false}
        sourceHint={
          online
            ? "แหล่งข้อมูล: Supabase · bi_activity_logs"
            : "แหล่งข้อมูล: โหลดไม่สำเร็จ"
        }
        skeleton={false}
        onRetry={() => {
          void retry();
          void load();
        }}
      />

      {pageLoading ? <BiListSkeleton rows={4} showSummary /> : null}

      {!pageLoading && !pageError ? (
        <div className="min-w-0 space-y-3">
          <ActivityDailySummary days={dailyAll} />

          {notifications.length > 0 ? (
            <section className="space-y-2">
              <SectionHeader title="Notification" />
              <div className="space-y-2">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    className="kl-section block space-y-1 kl-pressable"
                  >
                    <p className="kl-type-card-title">{n.title}</p>
                    <p className="kl-type-helper">{n.message}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <SectionHeader title="Workspace Feed" />
            <SearchBar
              placeholder="ค้นหาสรุป Actor Action..."
              value={query}
              onChange={setQuery}
            />
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {(
                [
                  ["all", "ทั้งหมด"],
                  ["create", "เพิ่ม"],
                  ["update", "แก้ไข"],
                  ["status", "สถานะ"],
                  ["archive", "Archive"],
                ] as const
              ).map(([id, label]) => (
                <SegmentChip
                  key={id}
                  label={label}
                  active={actionFilter === id}
                  href={
                    id === "all"
                      ? "/opening/activity"
                      : `/opening/activity?action=${id}`
                  }
                />
              ))}
              <SegmentChip
                label="Favorite"
                active={favoritesOnly}
                onClick={() => setFavoritesOnly((v) => !v)}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="ยังไม่มีรายการในฟีด"
                hint="เมื่อบันทึกหรือเปลี่ยนสถานะ รายการจะโผล่ที่นี่"
                actionLabel="ไปรายการเตรียมเปิดร้าน"
                actionHref="/opening/checklist"
              />
            ) : (
              <div className="space-y-4">
                {byDay.map((day) => (
                  <div key={day.dayKey} className="space-y-2">
                    <p className="kl-type-label">
                      {day.dayLabel} · {day.count} รายการ
                    </p>
                    {day.items.map((item) => (
                      <WorkspaceActivityItem
                        key={item.id}
                        item={item}
                        pinned={pinnedIds.includes(item.id)}
                        favorited={favoriteIds.includes(item.id)}
                        authorName={author}
                        mentionHints={mentionHints}
                        onTogglePin={() => setPinnedIds(togglePin(item.id))}
                        onToggleFavorite={() =>
                          setFavoriteIds(toggleFavorite(item.id))
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>

          <Card className="!p-3.5">
            <p className="kl-type-caption">
              History = ฟีดตามวัน · Recent Change = เรียงใหม่สุด ·
              Pin/Favorite/Comment เก็บในเครื่อง ไม่เปลี่ยน Database
            </p>
          </Card>

          <ButtonLink href="/opening" variant="secondary" fullWidth>
            กลับภาพรวมเปิดร้าน
          </ButtonLink>
        </div>
      ) : null}
    </AppShell>
  );
}

export default function OpeningActivityPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="" hidePageHeader compact backHref="/opening">
          <BiListSkeleton rows={4} />
        </AppShell>
      }
    >
      <OpeningActivityInner />
    </Suspense>
  );
}
