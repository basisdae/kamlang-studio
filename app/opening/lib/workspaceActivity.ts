/**
 * Workspace Activity helpers — derive feed views from bi_activity_logs.
 * No schema change.
 */

import type { ActivityLog } from "../../../lib/types/activity";

export type DailyActivitySummary = {
  dayKey: string;
  dayLabel: string;
  count: number;
  actors: string[];
  actions: Record<string, number>;
  items: ActivityLog[];
};

export type OpeningActivityNotification = {
  id: string;
  title: string;
  message: string;
  href: string;
  createdAt: string;
};

function dayKey(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso.slice(0, 10);
  const d = new Date(t);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabel(key: string) {
  const t = Date.parse(`${key}T12:00:00`);
  if (!Number.isFinite(t)) return key;
  const today = dayKey(new Date().toISOString());
  const yesterday = dayKey(new Date(Date.now() - 86400000).toISOString());
  if (key === today) return "วันนี้";
  if (key === yesterday) return "เมื่อวาน";
  return new Date(t).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatActivityWhen(iso: string): string {
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
  return new Date(t).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

export function groupActivitiesByDay(
  rows: ActivityLog[]
): DailyActivitySummary[] {
  const map = new Map<string, ActivityLog[]>();
  for (const row of rows) {
    const key = dayKey(row.createdAt);
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, list]) => {
      const actors = Array.from(
        new Set(list.map((r) => r.actorName).filter(Boolean))
      );
      const actions: Record<string, number> = {};
      for (const r of list) {
        actions[r.action] = (actions[r.action] ?? 0) + 1;
      }
      return {
        dayKey: key,
        dayLabel: dayLabel(key),
        count: list.length,
        actors,
        actions,
        samples: list.slice(0, 3),
        items: list,
      };
    });
}

export function sortFeed(
  rows: ActivityLog[],
  pinnedIds: string[]
): ActivityLog[] {
  const pinSet = new Set(pinnedIds);
  return [...rows].sort((a, b) => {
    const ap = pinSet.has(a.id) ? 1 : 0;
    const bp = pinSet.has(b.id) ? 1 : 0;
    if (ap !== bp) return bp - ap;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterFeed(
  rows: ActivityLog[],
  opts: {
    query?: string;
    favoritesOnly?: boolean;
    favoriteIds?: string[];
    action?: string;
  }
): ActivityLog[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  const fav = new Set(opts.favoriteIds ?? []);
  return rows.filter((row) => {
    if (opts.favoritesOnly && !fav.has(row.id)) return false;
    if (opts.action && opts.action !== "all" && row.action !== opts.action) {
      return false;
    }
    if (!q) return true;
    const hay = `${row.summary} ${row.actorName} ${row.action} ${row.entityType}`.toLowerCase();
    return hay.includes(q);
  });
}

/** Derive lightweight Opening notifications from recent activity (no new table). */
export function buildOpeningActivityNotifications(
  rows: ActivityLog[],
  withinHours = 48
): OpeningActivityNotification[] {
  const cutoff = Date.now() - withinHours * 3600_000;
  const recent = rows.filter((r) => Date.parse(r.createdAt) >= cutoff);
  const out: OpeningActivityNotification[] = [];

  const archives = recent.filter((r) => r.action === "archive");
  if (archives.length > 0) {
    out.push({
      id: "open-archive",
      title: "มีการ Archive",
      message: `${archives.length} รายการถูกเก็บในช่วง ${withinHours} ชม.`,
      href: "/opening/activity?action=archive",
      createdAt: archives[0].createdAt,
    });
  }

  const status = recent.filter((r) => r.action === "status");
  if (status.length > 0) {
    out.push({
      id: "open-status",
      title: "มีการเปลี่ยนสถานะ",
      message: `${status.length} ครั้ง · ตรวจ Checklist / จัดหา`,
      href: "/opening/activity?action=status",
      createdAt: status[0].createdAt,
    });
  }

  const creates = recent.filter((r) => r.action === "create");
  if (creates.length > 0) {
    out.push({
      id: "open-create",
      title: "รายการใหม่",
      message: `เพิ่ม ${creates.length} รายการใน Workspace`,
      href: "/opening/checklist",
      createdAt: creates[0].createdAt,
    });
  }

  return out;
}

export function activityEntityHref(row: ActivityLog): string | null {
  if (row.entityType === "asset" && row.entityId) {
    return `/opening/assets/${row.entityId}`;
  }
  return "/opening";
}

export const ACTION_LABELS: Record<string, string> = {
  create: "เพิ่ม",
  update: "แก้ไข",
  status: "เปลี่ยนสถานะ",
  archive: "Archive",
  unarchive: "กู้คืน",
  purchase: "ซื้อ",
  repair: "ซ่อม",
};
