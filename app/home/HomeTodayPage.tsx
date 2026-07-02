"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import AppShell from "../../components/layout/AppShell";
import {
  getEffectiveLowStockItems,
  getEffectiveOutOfStockItems,
} from "../inventory/inventoryAccess";
import { getNotificationCount } from "../lib/notificationService";
import { isInitialSetupComplete } from "../repositories/SettingsRepository";
import { getProductionRollupForPlan } from "../lib/productionRollupService";
import { getPurchaseListForDate } from "../lib/purchaseListService";
import { getEffectivePlanByDate } from "../production/planAccess";
import { formatProductionDate, todayPlanDate } from "../production/utils";
import { purchaseLineKey } from "../purchase/utils";
import { getPurchaseLineStatesForList } from "../repositories/SavedPurchaseRepository";
import { HOME_UI } from "./copy";
import HomeHero from "./components/HomeHero";
import HomeNextStep from "./components/HomeNextStep";
import HomeNotificationBadge from "./components/HomeNotificationBadge";
import HomeSetupBanner from "./components/HomeSetupBanner";
import { getHomeNextStep } from "./utils/getHomeNextStep";

export default function HomeTodayPage() {
  const pathname = usePathname();
  const today = todayPlanDate();

  const snapshot = useMemo(() => {
    const plan = getEffectivePlanByDate(today);
    const rollup = plan ? getProductionRollupForPlan(plan) : null;
    const purchaseList = getPurchaseListForDate(today);

    let boughtCount = 0;
    if (purchaseList) {
      const lineKeys = purchaseList.lines.map((line) =>
        purchaseLineKey(line.ingredientId, line.unit)
      );
      const states = getPurchaseLineStatesForList(
        purchaseList.planDate,
        purchaseList.planId,
        lineKeys
      );
      boughtCount = lineKeys.filter((key) => states[key]?.isBought).length;
    }

    const stockAlertCount =
      getEffectiveLowStockItems().length +
      getEffectiveOutOfStockItems().length;

    return {
      rollup,
      purchaseList,
      boughtCount,
      stockAlertCount,
    };
  }, [today, pathname]);

  const totalQuantity =
    snapshot.rollup?.menuLines.reduce((sum, line) => sum + line.quantity, 0) ??
    0;
  const notificationCount = useMemo(
    () => getNotificationCount(),
    [pathname]
  );
  const setupComplete = useMemo(
    () => isInitialSetupComplete(),
    [pathname]
  );
  const hasPlan = Boolean(snapshot.rollup);
  const purchaseTotal = snapshot.purchaseList?.lines.length ?? 0;

  const nextStep = useMemo(
    () =>
      getHomeNextStep({
        hasPlan,
        totalQuantity,
        purchaseTotal,
        boughtCount: snapshot.boughtCount,
        stockAlertCount: snapshot.stockAlertCount,
      }),
    [
      hasPlan,
      totalQuantity,
      purchaseTotal,
      snapshot.boughtCount,
      snapshot.stockAlertCount,
    ]
  );

  const heroTitle = !hasPlan
    ? HOME_UI.production.empty
    : nextStep.title === HOME_UI.ready
      ? HOME_UI.ready
      : HOME_UI.production.mustProduce(totalQuantity);

  return (
    <AppShell title="" hidePageHeader compact>
      <div className="space-y-3">
        {!setupComplete ? <HomeSetupBanner /> : null}

        <section
          className={`relative ${notificationCount > 0 ? "pr-[4.25rem]" : ""}`}
        >
          {notificationCount > 0 ? (
            <div className="absolute right-0 top-0 z-10">
              <HomeNotificationBadge count={notificationCount} />
            </div>
          ) : null}

          <HomeHero
            label={HOME_UI.today}
            title={heroTitle}
            subtitle={formatProductionDate(today)}
          />
        </section>

        <HomeNextStep step={nextStep} />
      </div>
    </AppShell>
  );
}
