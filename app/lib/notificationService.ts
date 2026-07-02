import {
  getEffectiveLowStockItems,
  getEffectiveOutOfStockItems,
} from "../inventory/inventoryAccess";
import { getPurchaseListForDate } from "./purchaseListService";
import { getEffectivePlanByDate } from "../production/planAccess";
import { formatProductionDate, todayPlanDate } from "../production/utils";
import { purchaseLineKey } from "../purchase/utils";
import { getRecentActivities } from "../repositories/ActivityLogRepository";
import { getPurchaseLineStatesForList } from "../repositories/SavedPurchaseRepository";
import type { KlNotification } from "../notifications/types";

const BACKUP_REMINDER_DAYS = 7;

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;

  const diffMs = Date.now() - then;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function buildInventoryOutNotification(): KlNotification | null {
  const outItems = getEffectiveOutOfStockItems();
  if (outItems.length === 0) return null;

  return {
    id: "inventory-out",
    type: "inventory_out",
    title: "วัตถุดิบหมด",
    message: `มี ${outItems.length} รายการที่ของหมด`,
    href: "/inventory",
  };
}

function buildInventoryLowNotification(): KlNotification | null {
  const lowItems = getEffectiveLowStockItems();
  if (lowItems.length === 0) return null;

  return {
    id: "inventory-low",
    type: "inventory_low",
    title: "วัตถุดิบใกล้หมด",
    message: `มี ${lowItems.length} รายการที่ใกล้หมด`,
    href: "/inventory",
  };
}

function buildProductionMissingNotification(today: string): KlNotification | null {
  const plan = getEffectivePlanByDate(today);
  if (plan) return null;

  return {
    id: `production-missing-${today}`,
    type: "production_missing",
    title: "ยังไม่มีแผนผลิตวันนี้",
    message: `ยังไม่ได้สร้างแผนผลิตสำหรับ ${formatProductionDate(today)}`,
    href: "/production",
  };
}

function buildPurchaseIncompleteNotification(today: string): KlNotification | null {
  const purchaseList = getPurchaseListForDate(today);
  if (!purchaseList || purchaseList.lines.length === 0) return null;

  const lineKeys = purchaseList.lines.map((line) =>
    purchaseLineKey(line.ingredientId, line.unit)
  );
  const states = getPurchaseLineStatesForList(
    purchaseList.planDate,
    purchaseList.planId,
    lineKeys
  );
  const pendingCount = lineKeys.filter((key) => !states[key]?.isBought).length;

  if (pendingCount === 0) return null;

  return {
    id: `purchase-incomplete-${today}`,
    type: "purchase_incomplete",
    title: "ซื้อของยังไม่ครบ",
    message: `เหลืออีก ${pendingCount} จาก ${lineKeys.length} รายการที่ยังไม่ได้ซื้อ`,
    href: "/purchase",
  };
}

function buildBackupReminderNotification(): KlNotification | null {
  const activities = getRecentActivities(200);
  if (activities.length === 0) return null;

  const lastBackup = activities.find(
    (activity) => activity.type === "backup_export"
  );

  if (lastBackup) {
    const elapsedDays = daysSince(lastBackup.createdAt);
    if (elapsedDays < BACKUP_REMINDER_DAYS) return null;

    return {
      id: "backup-reminder",
      type: "backup_reminder",
      title: "ควรสำรองข้อมูล",
      message: `ไม่ได้สำรองข้อมูลมา ${elapsedDays} วันแล้ว`,
      href: "/settings/data",
    };
  }

  return {
    id: "backup-reminder",
    type: "backup_reminder",
    title: "ควรสำรองข้อมูล",
    message: "ยังไม่เคยสำรองข้อมูล",
    href: "/settings/data",
  };
}

/**
 * Derives in-app notifications from current local data.
 * Not persisted — recomputed on each read.
 */
export function getNotifications(): KlNotification[] {
  if (typeof window === "undefined") return [];

  const today = todayPlanDate();

  return [
    buildInventoryOutNotification(),
    buildInventoryLowNotification(),
    buildProductionMissingNotification(today),
    buildPurchaseIncompleteNotification(today),
    buildBackupReminderNotification(),
  ].filter((notification): notification is KlNotification => notification !== null);
}

export function getNotificationCount(): number {
  return getNotifications().length;
}
