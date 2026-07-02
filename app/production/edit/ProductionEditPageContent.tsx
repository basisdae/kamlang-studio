"use client";

import { useSearchParams } from "next/navigation";
import AppShell from "../../../components/layout/AppShell";
import ProductionBuilderPageSkeleton from "../../../components/ui/skeletons/ProductionBuilderPageSkeleton";
import ProductionCostSummary from "../components/ProductionCostSummary";
import ProductionIngredientTotals from "../components/ProductionIngredientTotals";
import ProductionPackagingTotals from "../components/ProductionPackagingTotals";
import { todayPlanDate } from "../utils";
import ProductionBuilderForm from "./components/ProductionBuilderForm";
import ProductionBuilderSummary from "./components/ProductionBuilderSummary";
import VersionHistoryPanel from "../../../components/versionHistory/VersionHistoryPanel";
import { useProductionBuilder } from "./hooks/useProductionBuilder";

export default function ProductionEditPageContent() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? todayPlanDate();
  const duplicateFrom = searchParams.get("duplicateFrom");
  const builder = useProductionBuilder(initialDate, duplicateFrom);

  if (!builder.isLoaded) {
    return (
      <AppShell
        title="แผนผลิต"
        description="กำหนดวันที่ เป้าผลิต และจำนวนที่ต้องทำ"
        backHref="/production"
      >
        <ProductionBuilderPageSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={
        duplicateFrom
          ? "ทำสำเนาแผนผลิต"
          : builder.isEditMode
            ? "แก้ไขแผนผลิต"
            : "สร้างแผนผลิต"
      }
      description="กำหนดวันที่ เป้าผลิต และจำนวนที่ต้องทำ"
      backHref="/production"
    >
      <div className="space-y-7 pb-44">
        {builder.versionEntityId ? (
          <VersionHistoryPanel
            entityType="production_plan"
            entityId={builder.versionEntityId}
            onRestored={() => window.location.reload()}
          />
        ) : null}

        <ProductionBuilderForm
          date={builder.date}
          lines={builder.lines}
          menus={builder.menus}
          validationErrors={builder.validationErrors}
          onDateChange={builder.handleDateChange}
          onAddLine={builder.addLine}
          onRemoveLine={builder.removeLine}
          onUpdateLine={builder.updateLine}
        />

        {builder.preview ? (
          <>
            <ProductionCostSummary
              totalRecipeCost={builder.preview.totalRecipeCost}
              totalPackagingCost={builder.preview.totalPackagingCost}
              totalCost={builder.preview.totalCost}
            />
            <ProductionIngredientTotals
              ingredientTotals={builder.preview.ingredientTotals}
            />
            <ProductionPackagingTotals
              packagingTotals={builder.preview.packagingTotals}
            />
          </>
        ) : null}
      </div>

      <ProductionBuilderSummary
        preview={builder.preview}
        onSave={builder.handleSave}
      />
    </AppShell>
  );
}
