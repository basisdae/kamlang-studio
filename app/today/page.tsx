"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import HeroCard from "../../components/ui/HeroCard";
import AppShell from "../../components/layout/AppShell";
import { PRODUCTION_UI } from "../production/copy";
import { getProductionRollupForPlan } from "../lib/productionRollupService";
import { getEffectivePlanByDate } from "../production/planAccess";
import { formatProductionDate, todayPlanDate } from "../production/utils";
import {
  getStaffPrepCheckedStates,
  toggleStaffPrepItem,
} from "../repositories/StaffPrepChecklistRepository";
import StaffPrepChecklistSection from "./components/StaffPrepChecklistSection";
import StaffPrepEmpty from "./components/StaffPrepEmpty";
import {
  countChecked,
  getStaffIngredientItems,
  getStaffMenuItems,
  getStaffPackagingItems,
  getStaffPrepItemKeys,
} from "./utils";

export default function StaffTodayPage() {
  const pathname = usePathname();
  const today = todayPlanDate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [checkedStates, setCheckedStates] = useState<Record<string, boolean>>({});

  const plan = useMemo(
    () => getEffectivePlanByDate(today),
    [today, pathname, refreshKey]
  );

  const rollup = useMemo(() => {
    if (!plan) return null;

    try {
      return getProductionRollupForPlan(plan);
    } catch {
      return null;
    }
  }, [plan, refreshKey]);

  const menuItems = useMemo(
    () => (rollup ? getStaffMenuItems(rollup) : []),
    [rollup]
  );
  const ingredientItems = useMemo(
    () => (rollup ? getStaffIngredientItems(rollup) : []),
    [rollup]
  );
  const packagingItems = useMemo(
    () => (rollup ? getStaffPackagingItems(rollup) : []),
    [rollup]
  );
  const allItemKeys = useMemo(
    () => (rollup ? getStaffPrepItemKeys(rollup) : []),
    [rollup]
  );

  useEffect(() => {
    if (!plan || !rollup) {
      setCheckedStates({});
      return;
    }

    setCheckedStates(
      getStaffPrepCheckedStates(plan.date, plan.id, allItemKeys)
    );
  }, [plan, rollup, allItemKeys, refreshKey]);

  function handleToggle(itemKey: string) {
    if (!plan) return;

    toggleStaffPrepItem(plan.date, plan.id, itemKey);
    setRefreshKey((current) => current + 1);
  }

  const preparedCount = countChecked(allItemKeys, checkedStates);
  const totalCount = allItemKeys.length;

  return (
    <AppShell title="งานครัววันนี้" compact>
      {!rollup ? (
        <StaffPrepEmpty />
      ) : (
        <div className="space-y-4">
          <HeroCard
            module="today"
            label="ความคืบหน้า"
            title={`${preparedCount}/${totalCount} รายการ`}
            subtitle={formatProductionDate(today)}
          />

          <StaffPrepChecklistSection
            title={PRODUCTION_UI.sections.targetsToday}
            progressLabel={PRODUCTION_UI.progress.produced}
            items={menuItems}
            checkedStates={checkedStates}
            preparedCount={countChecked(
              menuItems.map((item) => item.key),
              checkedStates
            )}
            onToggle={handleToggle}
          />

          <StaffPrepChecklistSection
            title={PRODUCTION_UI.sections.ingredientsToPrep}
            items={ingredientItems}
            checkedStates={checkedStates}
            preparedCount={countChecked(
              ingredientItems.map((item) => item.key),
              checkedStates
            )}
            onToggle={handleToggle}
          />

          <StaffPrepChecklistSection
            title={PRODUCTION_UI.sections.packagingToPrep}
            items={packagingItems}
            checkedStates={checkedStates}
            preparedCount={countChecked(
              packagingItems.map((item) => item.key),
              checkedStates
            )}
            onToggle={handleToggle}
          />

        </div>
      )}
    </AppShell>
  );
}
