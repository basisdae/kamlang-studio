"use client";

import { ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import { getProductionRollupForPlan } from "../lib/productionRollupService";
import {
  getSavedPlanByDate,
  isProductionPlanDeducted,
  materializeProductionPlan,
  updateSavedProductionPlanStatus,
} from "../repositories/SavedProductionRepository";
import ProductionCostSummary from "./components/ProductionCostSummary";
import ProductionHeroActions from "./components/ProductionHeroActions";
import ProductionDeductConfirmSheet from "./components/ProductionDeductConfirmSheet";
import ProductionDeductedBanner from "./components/ProductionDeductedBanner";
import ProductionHero from "./components/ProductionHero";
import ProductionIngredientTotals from "./components/ProductionIngredientTotals";
import ProductionMenuLines from "./components/ProductionMenuLines";
import ProductionPackagingTotals from "./components/ProductionPackagingTotals";
import ProductionStatusControl from "./components/ProductionStatusControl";
import SectionLink from "../../components/ui/SectionLink";
import { getEffectivePlanByDate } from "./planAccess";
import type { ProductionPlanStatus } from "./types";
import {
  formatProductionDate,
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
        setDeductMessage("แผนนี้ตัดของในครัวไปแล้ว");
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
      title="แผนวันนี้"
      backHref="/"
      compact
    >
      {rollup ? (
        <ProductionHero
          dateLabel={formatProductionDate(today)}
          totalDishes={totalDishes}
          menuCount={rollup.menuLines.length}
          actions={
            <ProductionHeroActions
              editHref={editHref}
              planDate={today}
              canDelete
              onDeleted={refreshPlan}
            />
          }
        />
      ) : (
        <EmptyState
          {...EMPTY_STATE.production.noPlan}
          actionHref={editHref}
          icon={ClipboardList}
        />
      )}

      {rollup ? (
        <div className="space-y-4">
          <ProductionMenuLines menuLines={rollup.menuLines} />
          <ProductionIngredientTotals
            ingredientTotals={rollup.ingredientTotals}
          />
          <ProductionDeductedBanner plan={rollup.plan} />
          {deductMessage ? (
            <p className="kl-type-caption px-1 text-kl-warning-text">{deductMessage}</p>
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
          <SectionLink variant="nav" href="/purchase" title="ดูรายการซื้อของ" />
          <details className="kl-details">
            <summary className="kl-details-summary">ดูของห่อกลับบ้าน</summary>
            <div className="kl-details-body">
              <ProductionPackagingTotals packagingTotals={rollup.packagingTotals} />
            </div>
          </details>
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
