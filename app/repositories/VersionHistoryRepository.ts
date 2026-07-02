/**
 * Version history — snapshots before edits, stored in localStorage.
 */
import type { SavedInventoryAdjustment } from "../inventory/types";
import type { SavedMenu } from "../menus/builder/types";
import type { SavedProductionPlan } from "../production/builder/types";
import type { SavedRecipe } from "../recipes/builder/types";
import type {
  VersionEntityType,
  VersionHistory,
  VersionHistoryInput,
} from "../versionHistory/types";
import { updateSavedMenu } from "./SavedMenuRepository";
import {
  updateSavedProductionPlan,
} from "./SavedProductionRepository";
import { upsertInventoryAdjustment } from "./SavedInventoryRepository";
import { updateSavedRecipe } from "./SavedRecipeRepository";

export const KL_VERSION_HISTORY_KEY = "kl-version-history";

const MAX_VERSIONS_PER_ENTITY = 30;

function readAll(): VersionHistory[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(KL_VERSION_HISTORY_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isVersionHistory);
  } catch {
    return [];
  }
}

function writeAll(versions: VersionHistory[]): void {
  localStorage.setItem(KL_VERSION_HISTORY_KEY, JSON.stringify(versions));
}

function isVersionHistory(value: unknown): value is VersionHistory {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.entityType === "string" &&
    typeof record.entityId === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.note === "string" &&
    "snapshot" in record
  );
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `version-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function cloneSnapshot<T>(snapshot: T): T {
  return JSON.parse(JSON.stringify(snapshot)) as T;
}

function trimVersionsForEntity(
  versions: VersionHistory[],
  entityType: VersionEntityType,
  entityId: string
): VersionHistory[] {
  const matches = versions.filter(
    (version) =>
      version.entityType === entityType && version.entityId === entityId
  );
  const others = versions.filter(
    (version) =>
      version.entityType !== entityType || version.entityId !== entityId
  );

  if (matches.length <= MAX_VERSIONS_PER_ENTITY) {
    return versions;
  }

  const kept = matches
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_VERSIONS_PER_ENTITY);

  return [...others, ...kept];
}

export function addVersion(input: VersionHistoryInput): VersionHistory {
  const entry: VersionHistory = {
    id: createId(),
    entityType: input.entityType,
    entityId: input.entityId,
    snapshot: cloneSnapshot(input.snapshot),
    createdAt: new Date().toISOString(),
    note: input.note?.trim() || "ก่อนแก้ไข",
  };

  if (typeof window === "undefined") {
    return entry;
  }

  const next = trimVersionsForEntity(
    [entry, ...readAll()],
    input.entityType,
    input.entityId
  );
  writeAll(next);

  return entry;
}

export function getVersions(
  entityType: VersionEntityType,
  entityId: string
): VersionHistory[] {
  return readAll()
    .filter(
      (version) =>
        version.entityType === entityType && version.entityId === entityId
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function restoreVersion(
  entityType: VersionEntityType,
  entityId: string,
  versionId: string
): boolean {
  const version = getVersions(entityType, entityId).find(
    (item) => item.id === versionId
  );

  if (!version) return false;

  switch (entityType) {
    case "saved_recipe":
      updateSavedRecipe(cloneSnapshot(version.snapshot) as SavedRecipe, {
        recordVersion: false,
      });
      return true;
    case "saved_menu":
      updateSavedMenu(cloneSnapshot(version.snapshot) as SavedMenu, {
        recordVersion: false,
      });
      return true;
    case "production_plan":
      updateSavedProductionPlan(
        cloneSnapshot(version.snapshot) as SavedProductionPlan
      );
      return true;
    case "inventory_adjustment":
      upsertInventoryAdjustment(
        cloneSnapshot(version.snapshot) as SavedInventoryAdjustment,
        { recordVersion: false }
      );
      return true;
    default:
      return false;
  }
}
