/**
 * Builder workspace — persisted production plans in LocalStorage.
 *
 * Not the same as read-only seed plans (ProductionRepository).
 */
import type { SavedProductionPlan } from "../production/builder/types";
import type { ProductionPlanStatus } from "../production/types";
import { addActivity } from "./ActivityLogRepository";
import { addVersion } from "./VersionHistoryRepository";

export const KL_PRODUCTION_PLANS_KEY = "kl-production-plans";
export const KL_PRODUCTION_HIDDEN_DATES_KEY = "kl-production-hidden-dates";

function readAll(): SavedProductionPlan[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KL_PRODUCTION_PLANS_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as SavedProductionPlan[];
  } catch {
    return [];
  }
}

function writeAll(plans: SavedProductionPlan[]): void {
  localStorage.setItem(KL_PRODUCTION_PLANS_KEY, JSON.stringify(plans));
}

function readHiddenDates(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KL_PRODUCTION_HIDDEN_DATES_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeHiddenDates(dates: string[]): void {
  localStorage.setItem(KL_PRODUCTION_HIDDEN_DATES_KEY, JSON.stringify(dates));
}

function normalizeDate(date: string) {
  return date.trim();
}

export function getHiddenProductionDates(): string[] {
  return readHiddenDates();
}

export function isProductionDateHidden(date: string): boolean {
  const normalized = normalizeDate(date);

  return readHiddenDates().includes(normalized);
}

export function hideProductionDate(date: string): void {
  const normalized = normalizeDate(date);
  const hiddenDates = readHiddenDates();

  if (hiddenDates.includes(normalized)) return;

  writeHiddenDates([...hiddenDates, normalized]);
}

export function unhideProductionDate(date: string): void {
  const normalized = normalizeDate(date);

  writeHiddenDates(readHiddenDates().filter((value) => value !== normalized));
}

export function getAllSavedProductionPlans(): SavedProductionPlan[] {
  return readAll().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getSavedProductionPlanById(
  id: string
): SavedProductionPlan | undefined {
  return readAll().find((plan) => plan.id === id);
}

export function getSavedPlanByDate(
  date: string
): SavedProductionPlan | undefined {
  const normalized = normalizeDate(date);

  return readAll().find((plan) => plan.date === normalized);
}

export function createSavedProductionPlan(plan: SavedProductionPlan): void {
  const plans = readAll();
  plans.push(plan);
  writeAll(plans);
  unhideProductionDate(plan.date);
}

export function updateSavedProductionPlan(plan: SavedProductionPlan): void {
  const plans = readAll();
  const index = plans.findIndex((item) => item.id === plan.id);
  if (index === -1) return;

  plans[index] = plan;
  writeAll(plans);
  unhideProductionDate(plan.date);
}

export function upsertSavedProductionPlan(
  plan: SavedProductionPlan
): SavedProductionPlan {
  const existing = getSavedPlanByDate(plan.date);

  if (existing) {
    addVersion({
      entityType: "production_plan",
      entityId: existing.id,
      snapshot: {
        ...existing,
        lines: existing.lines.map((line) => ({ ...line })),
      },
      note: "ก่อนแก้ไข",
    });

    const updated: SavedProductionPlan = {
      ...existing,
      ...plan,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: plan.updatedAt,
      lines: plan.lines.map((line) => ({ ...line })),
    };

    updateSavedProductionPlan(updated);

    addActivity({
      type: "production_edit",
      message: `แก้ไขแผนผลิตวันที่ ${plan.date}`,
      entityType: "production",
      entityId: updated.id,
    });

    return updated;
  }

  createSavedProductionPlan({
    ...plan,
    lines: plan.lines.map((line) => ({ ...line })),
  });

  addActivity({
    type: "production_create",
    message: `สร้างแผนผลิตวันที่ ${plan.date}`,
    entityType: "production",
    entityId: plan.id,
  });

  return plan;
}

export function updateSavedProductionPlanStatus(
  date: string,
  status: ProductionPlanStatus
): SavedProductionPlan | null {
  const normalized = normalizeDate(date);
  const existing = getSavedPlanByDate(normalized);
  const now = new Date().toISOString();

  if (!existing) return null;

  const updated: SavedProductionPlan = {
    ...existing,
    status,
    updatedAt: now,
  };

  updateSavedProductionPlan(updated);
  return updated;
}

export function isProductionPlanDeducted(date: string): boolean {
  const saved = getSavedPlanByDate(normalizeDate(date));

  return Boolean(saved?.deducted);
}

export function markProductionPlanDeducted(date: string): SavedProductionPlan | null {
  const normalized = normalizeDate(date);
  const existing = getSavedPlanByDate(normalized);
  const now = new Date().toISOString();

  if (!existing) return null;

  const updated: SavedProductionPlan = {
    ...existing,
    status: "completed",
    deducted: true,
    deductedAt: now,
    updatedAt: now,
  };

  updateSavedProductionPlan(updated);
  return updated;
}

export function completeProductionPlanWithDeduction(
  plan: SavedProductionPlan
): SavedProductionPlan {
  const existing = getSavedPlanByDate(plan.date);
  const now = new Date().toISOString();

  const nextPlan: SavedProductionPlan = {
    ...plan,
    status: "completed",
    deducted: true,
    deductedAt: now,
    updatedAt: now,
    lines: plan.lines.map((line) => ({ ...line })),
  };

  if (existing) {
    if (existing.deducted) {
      return existing;
    }

    const updated: SavedProductionPlan = {
      ...existing,
      ...nextPlan,
      id: existing.id,
      createdAt: existing.createdAt,
    };

    updateSavedProductionPlan(updated);
    return updated;
  }

  createSavedProductionPlan({
    ...nextPlan,
    createdAt: plan.createdAt ?? now,
  });

  return nextPlan;
}

export type ProductionPlanUndoSnapshot =
  | { type: "saved"; plan: SavedProductionPlan }
  | { type: "hidden"; date: string };

export function restoreProductionPlanSnapshot(
  snapshot: ProductionPlanUndoSnapshot
): void {
  if (snapshot.type === "saved") {
    const plans = readAll();
    if (!plans.some((plan) => plan.id === snapshot.plan.id)) {
      plans.push({
        ...snapshot.plan,
        lines: snapshot.plan.lines.map((line) => ({ ...line })),
      });
      writeAll(plans);
    }

    unhideProductionDate(snapshot.plan.date);
    return;
  }

  unhideProductionDate(snapshot.date);
}

export function deleteSavedProductionPlan(id: string): void {
  writeAll(readAll().filter((plan) => plan.id !== id));
}

export function deleteProductionPlanForDate(
  date: string
): ProductionPlanUndoSnapshot | null {
  const normalized = normalizeDate(date);
  const saved = getSavedPlanByDate(normalized);

  if (saved) {
    deleteSavedProductionPlan(saved.id);

    addActivity({
      type: "production_delete",
      message: `ลบแผนผลิตวันที่ ${normalized}`,
      entityType: "production",
      entityId: saved.id,
    });

    return { type: "saved", plan: saved };
  }

  hideProductionDate(normalized);

  addActivity({
    type: "production_delete",
    message: `ลบแผนผลิตวันที่ ${normalized}`,
    entityType: "production",
    entityId: normalized,
  });

  return { type: "hidden", date: normalized };
}

export function materializeProductionPlan(
  plan: SavedProductionPlan
): SavedProductionPlan {
  const existing = getSavedPlanByDate(plan.date);

  if (existing) {
    const updated: SavedProductionPlan = {
      ...existing,
      ...plan,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: plan.updatedAt,
      lines: plan.lines.map((line) => ({ ...line })),
    };

    updateSavedProductionPlan(updated);
    return updated;
  }

  createSavedProductionPlan({
    ...plan,
    lines: plan.lines.map((line) => ({ ...line })),
  });

  return plan;
}
