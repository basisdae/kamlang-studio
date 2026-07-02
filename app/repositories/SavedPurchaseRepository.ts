/**
 * Purchase shopping state — persisted in LocalStorage.
 *
 * Tracks bought/not-bought and per-item shopping notes per production plan date.
 * Does not modify Production data.
 */
import type {
  SavedPurchaseLineState,
  SavedPurchaseState,
} from "../purchase/types";

export const KL_PURCHASE_STATES_KEY = "kl-purchase-states";

function readAll(): Record<string, SavedPurchaseState> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(KL_PURCHASE_STATES_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, SavedPurchaseState>;
  } catch {
    return {};
  }
}

function writeAll(states: Record<string, SavedPurchaseState>): void {
  localStorage.setItem(KL_PURCHASE_STATES_KEY, JSON.stringify(states));
}

function normalizeDate(date: string) {
  return date.trim();
}

function defaultLineState(): SavedPurchaseLineState {
  return { isBought: false, note: "" };
}

export function getSavedPurchaseState(
  planDate: string
): SavedPurchaseState | undefined {
  const normalized = normalizeDate(planDate);

  return readAll()[normalized];
}

export function getPurchaseLineStatesForList(
  planDate: string,
  planId: string,
  lineKeys: string[]
): Record<string, SavedPurchaseLineState> {
  const saved = getSavedPurchaseState(planDate);
  const states: Record<string, SavedPurchaseLineState> = {};

  for (const lineKey of lineKeys) {
    states[lineKey] = saved?.lines[lineKey] ?? defaultLineState();
  }

  return states;
}

export function updatePurchaseLineState(
  planDate: string,
  planId: string,
  lineKey: string,
  patch: Partial<SavedPurchaseLineState>
): SavedPurchaseLineState {
  const normalized = normalizeDate(planDate);
  const all = readAll();
  const now = new Date().toISOString();
  const existing = all[normalized] ?? {
    planDate: normalized,
    planId,
    lines: {},
    updatedAt: now,
  };

  const nextLine: SavedPurchaseLineState = {
    ...defaultLineState(),
    ...existing.lines[lineKey],
    ...patch,
  };

  all[normalized] = {
    planDate: normalized,
    planId,
    lines: {
      ...existing.lines,
      [lineKey]: nextLine,
    },
    updatedAt: now,
  };

  writeAll(all);
  return nextLine;
}

export function togglePurchaseLineBought(
  planDate: string,
  planId: string,
  lineKey: string
): SavedPurchaseLineState {
  const current =
    getSavedPurchaseState(planDate)?.lines[lineKey] ?? defaultLineState();

  return updatePurchaseLineState(planDate, planId, lineKey, {
    isBought: !current.isBought,
  });
}
