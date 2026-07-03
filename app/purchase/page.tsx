"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import { getPurchaseListForDate } from "../lib/purchaseListService";
import {
  getPurchaseLineStatesForList,
  togglePurchaseLineBought,
  updatePurchaseLineState,
} from "../repositories/SavedPurchaseRepository";
import { formatProductionDate, todayPlanDate } from "../production/utils";
import type { SavedPurchaseLineState } from "./types";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import PurchaseHero from "./components/PurchaseHero";
import PurchaseListHeader from "./components/PurchaseListHeader";
import PurchaseListItems from "./components/PurchaseListItems";
import PurchaseReceiveBar from "./components/PurchaseReceiveBar";
import PurchaseReceiveSheet from "./components/PurchaseReceiveSheet";
import { purchaseLineKey } from "./utils";

export default function PurchasePage() {
  const pathname = usePathname();
  const [today, setToday] = useState(todayPlanDate());
  const [lineStates, setLineStates] = useState<
    Record<string, SavedPurchaseLineState>
  >({});
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setToday(todayPlanDate());
  }, [pathname]);

  const purchaseList = useMemo(
    () => getPurchaseListForDate(today),
    [today, pathname, refreshKey]
  );

  const lineKeys = useMemo(
    () =>
      purchaseList?.lines.map((line) =>
        purchaseLineKey(line.ingredientId, line.unit)
      ) ?? [],
    [purchaseList]
  );

  useEffect(() => {
    if (!purchaseList) {
      setLineStates({});
      return;
    }

    setLineStates(
      getPurchaseLineStatesForList(
        purchaseList.planDate,
        purchaseList.planId,
        lineKeys
      )
    );
  }, [purchaseList, lineKeys, refreshKey]);

  const boughtCount = useMemo(
    () => lineKeys.filter((key) => lineStates[key]?.isBought).length,
    [lineKeys, lineStates]
  );

  const checkedCount = boughtCount;

  function refreshLineStates() {
    if (!purchaseList) return;

    setLineStates(
      getPurchaseLineStatesForList(
        purchaseList.planDate,
        purchaseList.planId,
        lineKeys
      )
    );
  }

  function handleToggle(lineKey: string) {
    if (!purchaseList) return;

    togglePurchaseLineBought(
      purchaseList.planDate,
      purchaseList.planId,
      lineKey
    );
    refreshLineStates();
  }

  function handleNoteChange(lineKey: string, note: string) {
    if (!purchaseList) return;

    updatePurchaseLineState(
      purchaseList.planDate,
      purchaseList.planId,
      lineKey,
      { note }
    );
    refreshLineStates();
  }

  function handleReceiveConfirmed() {
    setRefreshKey((current) => current + 1);
    refreshLineStates();
  }

  return (
    <AppShell
      title="ซื้อของ"
      backHref="/"
      compact
    >
      {!purchaseList ? (
        <EmptyState {...EMPTY_STATE.purchase.noPlan} />
      ) : (
        <div className="space-y-4 kl-scroll-above-bottom-bar">
          <PurchaseHero
            dateLabel={formatProductionDate(today)}
            boughtCount={boughtCount}
            totalCount={purchaseList.lines.length}
          />
          <PurchaseListHeader />
          <PurchaseListItems
            lines={purchaseList.lines}
            lineStates={lineStates}
            onToggle={handleToggle}
            onNoteChange={handleNoteChange}
          />
          <PurchaseReceiveBar
            eligibleCount={checkedCount}
            totalCount={purchaseList.lines.length}
            onReceive={() => setIsReceiveOpen(true)}
          />
          <PurchaseReceiveSheet
            isOpen={isReceiveOpen}
            purchaseList={purchaseList}
            lineStates={lineStates}
            onClose={() => setIsReceiveOpen(false)}
            onConfirm={handleReceiveConfirmed}
          />
        </div>
      )}
    </AppShell>
  );
}
