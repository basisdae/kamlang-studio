"use client";

import { ClipboardList, Pencil } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../components/layout/navConfig";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import { getModuleIconWellClass } from "../../components/ui/semanticColors";
import { getProductionRollupForPlan } from "../lib/productionRollupService";
import {
  getSavedPlanByDate,
  isProductionPlanDeducted,
  materializeProductionPlan,
  updateSavedProductionPlanStatus,
} from "../repositories/SavedProductionRepository";
import ProductionActionBar from "./components/ProductionActionBar";
import ProductionCostSummary from "./components/ProductionCostSummary";
import ProductionDeductConfirmSheet from "./components/ProductionDeductConfirmSheet";
import ProductionDeductedBanner from "./components/ProductionDeductedBanner";
import ProductionHero from "./components/ProductionHero";
import ProductionIngredientTotals from "./components/ProductionIngredientTotals";
import ProductionMenuLines from "./components/ProductionMenuLines";
import ProductionPackagingTotals from "./components/ProductionPackagingTotals";
import ProductionStatusControl from "./components/ProductionStatusControl";
import ProductionTodayHeader from "./components/ProductionTodayHeader";
import { getEffectivePlanByDate } from "./planAccess";
import type { ProductionPlanStatus } from "./types";
import {
  formatProductionDate,
  getProductionStatusLabel,
  todayPlanDate,
} from "./utils";

export default function ProductionPage() {
  const pathname = usePathname();
  const [today, setToday] = useState(todayPlanDate());
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDeductSheetOpen, setIsDeductSheetOpen] = useState(false);
  const [deductMessage, setDeductMessage] = useState<string | null>(null);

  useEffect(() => {
    setToday(todayPlanDate());
  }, [pathname, refreshKey]);

  const plan = useMemo(
    () => getEffectivePlanByDate(today),
    [today, refreshKey, pathname]
  );

  const rollup = useMemo(() => {
    if (!plan) return null;

    try {
      return getProductionRollupForPlan(plan);
    } catch {
      return null;
    }
  }, [plan, refreshKey]);

  function refreshPlan() {
    setRefreshKey((current) => current + 1);
  }

  function applyStatusOnly(status: ProductionPlanStatus) {
    const saved = getSavedPlanByDate(today);

    if (saved) {
      updateSavedProductionPlanStatus(today, status);
      refreshPlan();
      return;
    }

    if (!rollup) return;

    const now = new Date().toISOString();
    materializeProductionPlan({
      id: crypto.randomUUID(),
      date: rollup.plan.date,
      status,
      lines: rollup.plan.lines.map((line) => ({ ...line })),
      createdAt: now,
      updatedAt: now,
    });
    refreshPlan();
  }

  function handleStatusChange(status: ProductionPlanStatus) {
    setDeductMessage(null);

    if (status === "completed") {
      if (plan?.deducted || isProductionPlanDeducted(today)) {
        setDeductMessage("แผนนี้หักของในครัวไปแล้ว");
        applyStatusOnly("completed");
        return;
      }

      if (plan?.status !== "completed") {
        setIsDeductSheetOpen(true);
        return;
      }

      return;
    }

    applyStatusOnly(status);
  }

  function handleDeductConfirmed() {
    setDeductMessage(null);
    refreshPlan();
  }

  function handleDeductClose() {
    setIsDeductSheetOpen(false);
  }

  const editHref = `/production/edit?date=${today}`;
  const totalDishes =
    rollup?.menuLines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;

  return (
    <AppShell
      title="แผนผลิต"
      description="เมนูที่ต้องทำและความคืบหน้าวันนี้"
      backHref="/"
    >
      {rollup ? (
        <>
          <ProductionHero
            dateLabel={formatProductionDate(today)}
            totalDishes={totalDishes}
            menuCount={rollup.menuLines.length}
            statusLabel={getProductionStatusLabel(rollup.plan.status)}
          />

          <Link href={editHref} className="kl-section flex items-center gap-3 kl-pressable">
            <div
              className={`${getModuleIconWellClass("production")} pointer-events-none`}
              aria-hidden
            >
              <Pencil className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="kl-type-card-title">แก้ไขแผนผลิต</div>
              <p className="kl-type-helper mt-1">ปรับเป้าผลิตวันนี้</p>
            </div>
          </Link>
        </>
      ) : (
        <EmptyState
          {...EMPTY_STATE.production.noPlan}
          actionHref={editHref}
          icon={ClipboardList}
        />
      )}

      {rollup ? (
        <div className="space-y-6 kl-scroll-above-tall-bottom-bar">
          <ProductionMenuLines menuLines={rollup.menuLines} />
          <ProductionIngredientTotals
            ingredientTotals={rollup.ingredientTotals}
          />
          <ProductionTodayHeader plan={rollup.plan} />
          <ProductionDeductedBanner plan={rollup.plan} />
          {deductMessage ? (
            <Card className="space-y-2">
              <Badge tone="warning">หมายเหตุ</Badge>
              <p className="kl-type-caption text-kl-warning-text">{deductMessage}</p>
            </Card>
          ) : null}
          <ProductionStatusControl
            status={rollup.plan.status}
            onChange={handleStatusChange}
          />
          <ProductionCostSummary
            totalRecipeCost={rollup.totalRecipeCost}
            totalPackagingCost={rollup.totalPackagingCost}
            totalCost={rollup.totalCost}
          />
          <details className="kl-details">
            <summary className="kl-details-summary">ดูบรรจุภัณฑ์</summary>
            <div className="kl-details-body">
              <ProductionPackagingTotals packagingTotals={rollup.packagingTotals} />
            </div>
          </details>
          <ProductionActionBar
            planDate={today}
            canDelete
            onDeleted={refreshPlan}
          />
          <ProductionDeductConfirmSheet
            isOpen={isDeductSheetOpen}
            rollup={rollup}
            onClose={handleDeductClose}
            onConfirmed={handleDeductConfirmed}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
