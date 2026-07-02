/**
 * Staff prep checklist — persisted in LocalStorage.
 *
 * Tracks prep checkboxes per production plan date for the /today staff view.
 * Does not modify Production data.
 */
import type { StaffPrepChecklistState } from "../today/types";

export const KL_STAFF_PREP_KEY = "kl-staff-prep-checklist";

function readAll(): Record<string, StaffPrepChecklistState> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(KL_STAFF_PREP_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as Record<string, StaffPrepChecklistState>;
  } catch {
    return {};
  }
}

function writeAll(states: Record<string, StaffPrepChecklistState>): void {
  localStorage.setItem(KL_STAFF_PREP_KEY, JSON.stringify(states));
}

function normalizeDate(date: string) {
  return date.trim();
}

export function getStaffPrepCheckedStates(
  planDate: string,
  planId: string,
  itemKeys: string[]
): Record<string, boolean> {
  const saved = readAll()[normalizeDate(planDate)];
  const states: Record<string, boolean> = {};

  for (const itemKey of itemKeys) {
    states[itemKey] = saved?.checked[itemKey] ?? false;
  }

  if (saved && saved.planId !== planId) {
    for (const itemKey of itemKeys) {
      states[itemKey] = false;
    }
  }

  return states;
}

export function setStaffPrepItemChecked(
  planDate: string,
  planId: string,
  itemKey: string,
  isChecked: boolean
): void {
  const normalized = normalizeDate(planDate);
  const all = readAll();
  const now = new Date().toISOString();
  const existing = all[normalized];
  const checked = { ...(existing?.planId === planId ? existing.checked : {}) };

  if (isChecked) {
    checked[itemKey] = true;
  } else {
    delete checked[itemKey];
  }

  all[normalized] = {
    planDate: normalized,
    planId,
    checked,
    updatedAt: now,
  };

  writeAll(all);
}

export function toggleStaffPrepItem(
  planDate: string,
  planId: string,
  itemKey: string
): boolean {
  const current = getStaffPrepCheckedStates(planDate, planId, [itemKey])[itemKey];
  const next = !current;

  setStaffPrepItemChecked(planDate, planId, itemKey, next);
  return next;
}
