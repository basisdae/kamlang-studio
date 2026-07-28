"use client";

import AppShell from "../../../components/layout/AppShell";
import ButtonLink from "../../../components/ui/ButtonLink";
import MenuBuilderForm from "./components/MenuBuilderForm";
import MenuBuilderSummary from "./components/MenuBuilderSummary";
import { useMenuBuilder } from "./hooks/useMenuBuilder";

export default function NewMenuPage() {
  const builder = useMenuBuilder();

  return (
    <AppShell title="สร้างเมนูขาย" backHref="/menus" compact>
      <div className="space-y-4 kl-builder-scroll">
        <MenuBuilderForm
          recipes={builder.recipes}
          packagingSets={builder.packagingSets}
          name={builder.name}
          category={builder.category}
          recipeId={builder.recipeId}
          recipeMode={builder.recipeMode}
          packagingSetId={builder.packagingSetId}
          sellingPrice={builder.sellingPrice}
          saleStatus={builder.saleStatus}
          notes={builder.notes}
          costNotice={builder.costNotice}
          validationErrors={builder.validationErrors}
          onNameChange={builder.setName}
          onCategoryChange={builder.setCategory}
          onRecipeIdChange={builder.setRecipeId}
          onRecipeModeChange={builder.setRecipeMode}
          onPackagingSetIdChange={builder.setPackagingSetId}
          onSellingPriceChange={builder.setSellingPrice}
          onSaleStatusChange={builder.setSaleStatus}
          onNotesChange={builder.setNotes}
        />
        <ButtonLink href="/menus" variant="secondary" fullWidth className="min-h-[44px]">
          ยกเลิก
        </ButtonLink>
      </div>

      <MenuBuilderSummary
        preview={builder.preview}
        onSave={builder.handleSave}
        saving={builder.saving}
        costNotice={builder.costNotice}
      />
    </AppShell>
  );
}
