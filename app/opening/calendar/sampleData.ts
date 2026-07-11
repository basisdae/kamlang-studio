/**
 * Re-export Tang Tao seed + calendar helpers.
 * Source of truth: data/seed/tangtao.ts
 */

export {
  OPENING_CALENDAR_TASKS,
  WORKSPACE_NAME,
  type CalendarPriority,
  type CalendarTaskStatus,
  type OpeningCalendarTask,
} from "../../../data/seed/tangtao";

import type {
  CalendarPriority,
  CalendarTaskStatus,
  OpeningCalendarTask,
} from "../../../data/seed/tangtao";
import { OPENING_CALENDAR_TASKS } from "../../../data/seed/tangtao";

export const CALENDAR_STATUS_LABELS: Record<CalendarTaskStatus, string> = {
  done: "เสร็จแล้ว",
  in_progress: "กำลังทำ",
  upcoming: "ใกล้ถึง",
  overdue: "เลยกำหนด",
};

export const CALENDAR_PRIORITY_LABELS: Record<CalendarPriority, string> = {
  must: "Must",
  should: "Should",
  nice: "Nice",
};

export function getCalendarSummary(
  tasks: OpeningCalendarTask[] = OPENING_CALENDAR_TASKS
) {
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    upcoming: tasks.filter((t) => t.status === "upcoming").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
    next: tasks.find(
      (t) => t.status === "in_progress" || t.status === "upcoming"
    ),
  };
}

export function sortCalendarTasks(
  tasks: OpeningCalendarTask[] = OPENING_CALENDAR_TASKS
) {
  return [...tasks].sort(
    (a, b) => new Date(a.day).getTime() - new Date(b.day).getTime()
  );
}
