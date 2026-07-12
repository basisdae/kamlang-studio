/**
 * Workspace Activity UI preferences — Favorite / Pin / Comment.
 * Stored in localStorage only (no schema change). Not business SSoT.
 */

export const FAVORITES_KEY = "bi.activity.favorites";
export const PINS_KEY = "bi.activity.pins";
export const COMMENTS_KEY = "bi.activity.comments";

export type ActivityComment = {
  id: string;
  activityId: string;
  body: string;
  /** Parsed @mentions from body */
  mentions: string[];
  author: string;
  createdAt: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* preference only */
  }
}

export function getFavoriteIds(): string[] {
  return readJson<string[]>(FAVORITES_KEY, []);
}

export function toggleFavorite(activityId: string): string[] {
  const cur = getFavoriteIds();
  const next = cur.includes(activityId)
    ? cur.filter((id) => id !== activityId)
    : [...cur, activityId];
  writeJson(FAVORITES_KEY, next);
  return next;
}

export function getPinnedIds(): string[] {
  return readJson<string[]>(PINS_KEY, []);
}

export function togglePin(activityId: string): string[] {
  const cur = getPinnedIds();
  const next = cur.includes(activityId)
    ? cur.filter((id) => id !== activityId)
    : [...cur, activityId];
  writeJson(PINS_KEY, next);
  return next;
}

export function getComments(): ActivityComment[] {
  return readJson<ActivityComment[]>(COMMENTS_KEY, []);
}

export function getCommentsForActivity(activityId: string): ActivityComment[] {
  return getComments()
    .filter((c) => c.activityId === activityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function parseMentions(body: string): string[] {
  const matches = body.match(/@([\u0E00-\u0E7Fa-zA-Z0-9_.-]+)/g) ?? [];
  return Array.from(
    new Set(matches.map((m) => m.slice(1).trim()).filter(Boolean))
  );
}

export function addComment(input: {
  activityId: string;
  body: string;
  author: string;
}): ActivityComment {
  const body = input.body.trim();
  const comment: ActivityComment = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    activityId: input.activityId,
    body,
    mentions: parseMentions(body),
    author: input.author.trim() || "ผู้ใช้งาน",
    createdAt: new Date().toISOString(),
  };
  const next = [comment, ...getComments()].slice(0, 500);
  writeJson(COMMENTS_KEY, next);
  return comment;
}
