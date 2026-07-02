/**
 * Activity log — persisted in localStorage.
 *
 * @see app/activity/types.ts
 */
import type { ActivityLog, ActivityLogInput } from "../activity/types";

export const KL_ACTIVITY_LOG_KEY = "kl-activity-log";

const MAX_ACTIVITIES = 200;
const DEFAULT_LIMIT = 50;

function readAll(): ActivityLog[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KL_ACTIVITY_LOG_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isActivityLog);
  } catch {
    return [];
  }
}

function writeAll(activities: ActivityLog[]): void {
  localStorage.setItem(KL_ACTIVITY_LOG_KEY, JSON.stringify(activities));
}

function isActivityLog(value: unknown): value is ActivityLog {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.type === "string" &&
    typeof record.message === "string" &&
    typeof record.entityType === "string" &&
    typeof record.entityId === "string" &&
    typeof record.createdAt === "string"
  );
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Returns recent activities, newest first.
 */
export function getRecentActivities(limit = DEFAULT_LIMIT): ActivityLog[] {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT;

  return readAll()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, safeLimit);
}

/**
 * Append an activity entry. Keeps the newest MAX_ACTIVITIES entries.
 */
export function addActivity(input: ActivityLogInput): ActivityLog {
  const entry: ActivityLog = {
    id: createId(),
    type: input.type,
    message: input.message.trim(),
    entityType: input.entityType,
    entityId: input.entityId,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  if (typeof window === "undefined") {
    return entry;
  }

  const next = [entry, ...readAll()].slice(0, MAX_ACTIVITIES);
  writeAll(next);

  return entry;
}
