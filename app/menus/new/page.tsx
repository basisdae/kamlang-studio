"use client";

import AppShell from "../../../components/layout/AppShell";
import MenuBuilderForm from "./components/MenuBuilderForm";
import MenuBuilderSummary from "./components/MenuBuilderSummary";
import { useMenuBuilder } from "./hooks/useMenuBuilder";

export default function NewMenuPage() {
  const builder = useMenuBuilder();

  return (
    <AppShell
      title="สร้างเมนูขาย"
      description="เลือกสูตร ชุดบรรจุภัณฑ์ และราคาขาย"
      backHref="/menus"
    >
      <div className="space-y-4 pb-44">
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

      <MenuBuilderSummary preview={builder.preview} onSave={builder.handleSave} />
    </AppShell>
  );
}
