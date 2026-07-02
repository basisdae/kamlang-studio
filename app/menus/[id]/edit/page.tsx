"use client";

import { useParams } from "next/navigation";
import AppShell from "../../../../components/layout/AppShell";
import EmptyState from "../../../../components/ui/EmptyState";
import MenuBuilderPageSkeleton from "../../../../components/ui/skeletons/MenuBuilderPageSkeleton";
import MenuBuilderForm from "../../new/components/MenuBuilderForm";
import { EMPTY_STATE } from "../../../copy/emptyStates";
import MenuBuilderSummary from "../../new/components/MenuBuilderSummary";
import VersionHistoryPanel from "../../../../components/versionHistory/VersionHistoryPanel";
import { useMenuBuilder } from "../../new/hooks/useMenuBuilder";

export default function EditMenuPage() {
  const params = useParams<{ id: string }>();
  const builder = useMenuBuilder(params.id);

  if (!builder.isLoaded) {
    return (
      <AppShell
        title="แก้ไขเมนูขาย"
        description="ปรับสูตร บรรจุภัณฑ์ และราคาขาย"
        backHref={`/menus/${params.id}`}
      >
        <MenuBuilderPageSkeleton />
      </AppShell>
    );
  }

  if (builder.menuNotFound) {
    return (
      <AppShell
        title="ไม่พบเมนูขาย"
        description="เมนูขายนี้แก้ไขไม่ได้"
        backHref="/menus"
      >
        <EmptyState {...EMPTY_STATE.menus.editNotFound} />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="แก้ไขเมนูขาย"
      description="ปรับสูตร บรรจุภัณฑ์ และราคาขาย"
      backHref={`/menus/${params.id}`}
    >
      <div className="space-y-4 pb-44">
        <VersionHistoryPanel
          entityType="saved_menu"
          entityId={params.id}
          onRestored={() => window.location.reload()}
        />

        <MenuBuilderForm
          recipes={builder.recipes}
          packagingSets={builder.packagingSets}
          name={builder.name}
          category={builder.category}
          recipeId={builder.recipeId}
          packagingSetId={builder.packagingSetId}
          sellingPrice={builder.sellingPrice}
          validationErrors={builder.validationErrors}
          onNameChange={builder.setName}
          onCategoryChange={builder.setCategory}
          onRecipeIdChange={builder.setRecipeId}
          onPackagingSetIdChange={builder.setPackagingSetId}
          onSellingPriceChange={builder.setSellingPrice}
        />
      </div>

      <MenuBuilderSummary
        preview={builder.preview}
        onSave={builder.handleSave}
        saveLabel="บันทึกการแก้ไข"
      />
    </AppShell>
  );
}
