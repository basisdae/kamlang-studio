"use client";

import { useSearchParams } from "next/navigation";
import AppShell from "../../../components/layout/AppShell";
import ProductionBuilderPageSkeleton from "../../../components/ui/skeletons/ProductionBuilderPageSkeleton";
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
        title="แผนวันนี้"
        description="เลือกเมนู ใส่จำนวน แล้วบันทึก"
        backHref="/production"
        compact
      >
        <ProductionBuilderPageSkeleton />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={
        duplicateFrom
          ? "คัดลอกแผนวันนี้"
          : builder.isEditMode
            ? "แก้ไขแผนวันนี้"
            : "วางแผนวันนี้"
      }
      description="เลือกเมนู ใส่จำนวน แล้วบันทึก"
      backHref="/production"
      compact
    >
      <div className="space-y-4 kl-builder-scroll">
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
      </div>

      <ProductionBuilderSummary
        preview={builder.preview}
        onSave={builder.handleSave}
      />
    </AppShell>
  );
}
