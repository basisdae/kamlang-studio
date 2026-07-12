/**
 * Re-export Tang Tao seed + calendar helpers.
 * Clean-start: no mock calendar tasks.
 */

export {
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
import { OPENING_CALENDAR_TASKS as SEED_OPENING_CALENDAR_TASKS } from "../../../data/seed/tangtao";
import { isCleanStart } from "../../../lib/bi/cleanStart";

export const OPENING_CALENDAR_TASKS: OpeningCalendarTask[] = isCleanStart()
  ? []
  : SEED_OPENING_CALENDAR_TASKS;

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
