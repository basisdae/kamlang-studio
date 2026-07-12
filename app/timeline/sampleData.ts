/**
 * Re-export Tang Tao seed + timeline helpers.
 * Source of truth: data/seed/tangtao.ts
 * Clean-start: no mock timeline events.
 */

export {
  WORKSPACE_NAME,
  type TimelineEvent,
  type TimelineEventKind,
} from "../../data/seed/tangtao";

import type { TimelineEvent } from "../../data/seed/tangtao";
import { TIMELINE_EVENTS as SEED_TIMELINE_EVENTS } from "../../data/seed/tangtao";
import { isCleanStart } from "../../lib/bi/cleanStart";

export const TIMELINE_EVENTS: TimelineEvent[] = isCleanStart()
  ? []
  : SEED_TIMELINE_EVENTS;

export type TimelineDayGroup = {
  dateKey: string;
  label: string;
  events: TimelineEvent[];
};

function toDateKey(iso: string) {
  return iso.slice(0, 10);
}

function formatDayLabel(dateKey: string) {
  const todayKey = "2026-07-11";
  const yesterdayKey = "2026-07-10";

  if (dateKey === todayKey) return "วันนี้ · 11 ก.ค. 2569";
  if (dateKey === yesterdayKey) return "เมื่อวาน · 10 ก.ค. 2569";

  const [y, m, d] = dateKey.split("-").map(Number);
  const months = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];
  return `${d} ${months[m - 1]} ${y + 543}`;
}

export function formatEventTime(iso: string) {
  const hour = iso.slice(11, 13);
  const minute = iso.slice(14, 16);
  return `${hour}:${minute}`;
}

export function groupTimelineByDay(
  events: TimelineEvent[] = TIMELINE_EVENTS
): TimelineDayGroup[] {
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  const map = new Map<string, TimelineEvent[]>();
  for (const event of sorted) {
    const key = toDateKey(event.at);
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  }

  return [...map.entries()].map(([dateKey, dayEvents]) => ({
    dateKey,
    label: formatDayLabel(dateKey),
    events: dayEvents,
  }));
}

export function getTimelineSummary(events: TimelineEvent[] = TIMELINE_EVENTS) {
  const todayKey = "2026-07-11";
  const todayCount = events.filter((e) => toDateKey(e.at) === todayKey).length;
  const people = new Set(events.map((e) => e.person));

  return {
    eventCount: events.length,
    todayCount,
    peopleCount: people.size,
    latest: [...events].sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
    )[0],
  };
}
