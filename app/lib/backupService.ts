/**
 * Export and restore all local user data from localStorage.
 *
 * Does not touch demo JSON seed files.
 *
 * @see app/settings/data/README.md
 */
import { resetIngredientCache } from "../ingredients/IngredientRepository";
import { resetInventoryCache } from "../inventory/InventoryRepository";
import { resetMenuCache } from "../menu/MenuRepository";
import { resetPackagingItemCache } from "../packaging/PackagingItemRepository";
import { resetPackagingCache } from "../packaging/PackagingRepository";
import { resetPackagingSetCache } from "../packaging/PackagingSetRepository";
import { resetProductionPlanCache } from "../production/ProductionRepository";
import { KL_BUILDER_MENUS_KEY } from "../repositories/SavedMenuRepository";
import { KL_INVENTORY_ADJUSTMENTS_KEY } from "../repositories/SavedInventoryRepository";
import { KL_PURCHASE_STATES_KEY } from "../repositories/SavedPurchaseRepository";
import {
  KL_PRODUCTION_HIDDEN_DATES_KEY,
  KL_PRODUCTION_PLANS_KEY,
} from "../repositories/SavedProductionRepository";
import { KL_BUILDER_RECIPES_KEY } from "../repositories/SavedRecipeRepository";
import { KL_SETTINGS_KEY } from "../repositories/SettingsRepository";
import { addActivity } from "../repositories/ActivityLogRepository";
import {
  KL_USER_MASTER_INGREDIENTS_KEY,
  KL_USER_MASTER_MENUS_KEY,
  KL_USER_MASTER_PACKAGING_KEY,
  KL_USER_MASTER_RECIPES_KEY,
} from "../repositories/UserMasterDataRepository";
import { resetRecipeCache } from "../recipes/RecipeRepository";
import { resetKnowledgeCache } from "../repositories/KnowledgeRepository";
import {
  KL_BACKUP_APP_ID,
  KL_BACKUP_VERSION,
  type BackupRestoreSummary,
  type BackupValidationResult,
  type KlBackupBundle,
} from "../settings/data/types";

const ARRAY_STORAGE_KEYS = [
  KL_USER_MASTER_INGREDIENTS_KEY,
  KL_USER_MASTER_RECIPES_KEY,
  KL_USER_MASTER_PACKAGING_KEY,
  KL_USER_MASTER_MENUS_KEY,
  KL_BUILDER_RECIPES_KEY,
  KL_BUILDER_MENUS_KEY,
  KL_PRODUCTION_PLANS_KEY,
  KL_PRODUCTION_HIDDEN_DATES_KEY,
] as const;

const OBJECT_STORAGE_KEYS = [
  KL_SETTINGS_KEY,
  KL_PURCHASE_STATES_KEY,
  KL_INVENTORY_ADJUSTMENTS_KEY,
] as const;

export const ALL_USER_STORAGE_KEYS = [
  ...ARRAY_STORAGE_KEYS,
  ...OBJECT_STORAGE_KEYS,
] as const;

export type UserStorageKey = (typeof ALL_USER_STORAGE_KEYS)[number];

export type UserStorageSnapshot = Record<UserStorageKey, string | null>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStorageValue(key: UserStorageKey): unknown {
  if (typeof window === "undefined") return undefined;

  const raw = localStorage.getItem(key);
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

function hasAnyUserData(): boolean {
  return ALL_USER_STORAGE_KEYS.some((key) => localStorage.getItem(key) !== null);
}

export function exportUserBackup(): KlBackupBundle {
  const data: Record<string, unknown> = {};

  for (const key of ALL_USER_STORAGE_KEYS) {
    const value = readStorageValue(key);
    if (value !== undefined) {
      data[key] = value;
    }
  }

  return {
    version: KL_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: KL_BACKUP_APP_ID,
    data,
  };
}

export function createBackupDownloadFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `kl-builder-backup-${stamp}.json`;
}

export function downloadUserBackup(): void {
  const bundle = exportUserBackup();
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = createBackupDownloadFilename();
  anchor.click();

  URL.revokeObjectURL(url);

  addActivity({
    type: "backup_export",
    message: "บันทึกไฟล์เก็บข้อมูลร้าน",
    entityType: "backup",
    entityId: "export",
  });
}

export function validateBackupBundle(raw: unknown): BackupValidationResult {
  const errors: string[] = [];

  if (!isRecord(raw)) {
    return { valid: false, errors: ["ไฟล์ไม่ใช่ JSON ที่ถูกต้อง"] };
  }

  if (raw.version !== KL_BACKUP_VERSION) {
    errors.push(`รองรับเฉพาะ backup version ${KL_BACKUP_VERSION}`);
  }

  if (raw.app !== KL_BACKUP_APP_ID) {
    errors.push("ไฟล์ไม่ใช่ backup ของ KL Builder");
  }

  if (!isRecord(raw.data)) {
    errors.push('ต้องมีฟิลด์ "data"');
    return { valid: false, errors };
  }

  const data = raw.data;
  const keys = Object.keys(data);

  if (keys.length === 0) {
    errors.push("ไฟล์ backup ไม่มีข้อมูลผู้ใช้");
  }

  for (const key of keys) {
    if (!ALL_USER_STORAGE_KEYS.includes(key as UserStorageKey)) {
      errors.push(`พบคีย์ที่ไม่รู้จัก: ${key}`);
      continue;
    }

    const value = data[key];

    if (ARRAY_STORAGE_KEYS.includes(key as (typeof ARRAY_STORAGE_KEYS)[number])) {
      if (!Array.isArray(value)) {
        errors.push(`"${key}" ต้องเป็น array`);
      }
      continue;
    }

    if (!isRecord(value)) {
      errors.push(`"${key}" ต้องเป็น object`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    bundle: {
      version: KL_BACKUP_VERSION,
      exportedAt:
        typeof raw.exportedAt === "string" && raw.exportedAt.trim()
          ? raw.exportedAt
          : new Date().toISOString(),
      app: KL_BACKUP_APP_ID,
      data,
    },
  };
}

export function captureUserStorageSnapshot(): UserStorageSnapshot {
  const snapshot = {} as UserStorageSnapshot;

  if (typeof window === "undefined") {
    return snapshot;
  }

  for (const key of ALL_USER_STORAGE_KEYS) {
    snapshot[key] = localStorage.getItem(key);
  }

  return snapshot;
}

export function applyUserStorageSnapshot(snapshot: UserStorageSnapshot): void {
  if (typeof window === "undefined") return;

  for (const key of ALL_USER_STORAGE_KEYS) {
    const value = snapshot[key];

    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  resetAllApplicationCaches();
}

export function restoreUserBackup(bundle: KlBackupBundle): BackupRestoreSummary {
  const restoredKeys: string[] = [];
  const clearedKeys: string[] = [];

  for (const key of ALL_USER_STORAGE_KEYS) {
    if (key in bundle.data) {
      localStorage.setItem(key, JSON.stringify(bundle.data[key]));
      restoredKeys.push(key);
    } else {
      localStorage.removeItem(key);
      clearedKeys.push(key);
    }
  }

  resetAllApplicationCaches();

  addActivity({
    type: "backup_restore",
    message: `เอาข้อมูลกลับมา ${restoredKeys.length} ส่วน`,
    entityType: "backup",
    entityId: bundle.exportedAt,
  });

  return { restoredKeys, clearedKeys };
}

export function resetAllApplicationCaches(): void {
  resetIngredientCache();
  resetRecipeCache();
  resetMenuCache();
  resetPackagingItemCache();
  resetPackagingCache();
  resetPackagingSetCache();
  resetProductionPlanCache();
  resetInventoryCache();
  resetKnowledgeCache();
}

export function getUserDataPresenceSummary(): {
  hasData: boolean;
  keyCount: number;
} {
  if (typeof window === "undefined") {
    return { hasData: false, keyCount: 0 };
  }

  const keyCount = ALL_USER_STORAGE_KEYS.filter(
    (key) => localStorage.getItem(key) !== null
  ).length;

  return {
    hasData: hasAnyUserData(),
    keyCount,
  };
}
