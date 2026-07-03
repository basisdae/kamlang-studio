"use client";

import AppShell from "../../../components/layout/AppShell";
import BottomSummary from "./components/BottomSummary";
import HeaderForm from "./components/HeaderForm";
import IngredientPopup from "./components/IngredientPopup";
import RecipeLines from "./components/RecipeLines";
import VersionHistoryPanel from "../../../components/versionHistory/VersionHistoryPanel";
import { useRecipeBuilder } from "./hooks/useRecipeBuilder";

export default function RecipeBuilderPage() {
  const builder = useRecipeBuilder();

  return (
    <AppShell
      title="สร้างสูตร"
      backHref="/recipes"
      compact
    >
      <div className="space-y-4 kl-builder-scroll">
        {builder.editingRecipeId ? (
          <VersionHistoryPanel
            entityType="saved_recipe"
            entityId={builder.editingRecipeId}
            onRestored={() => window.location.reload()}
          />
        ) : null}

        <HeaderForm
          menuName={builder.menuName}
          category={builder.category}
          menuNameError={builder.validationErrors.menuName}
          onMenuNameChange={builder.handleMenuNameChange}
          onCategoryChange={builder.setCategory}
        />

        <RecipeLines
          lines={builder.lines}
          ingredientsError={builder.validationErrors.ingredients}
          onRemoveLine={builder.removeLine}
          onEditLine={builder.editLine}
          onAddIngredient={builder.openIngredientPopup}
        />
      </div>

      <IngredientPopup
        isOpen={builder.isIngredientPopupOpen}
        isEditingLine={builder.editingLineIndex !== null}
        onClose={builder.closeIngredientPopup}
        search={builder.search}
        onSearchChange={builder.setSearch}
        filteredIngredients={builder.filteredIngredients}
        selectedIngredient={builder.selectedIngredient}
        onSelectIngredient={builder.selectIngredient}
        quantity={builder.quantity}
        onQuantityChange={builder.setQuantity}
        unit={builder.unit}
        onUnitChange={builder.setUnit}
        onAdd={builder.addIngredient}
        onCancelSelection={builder.cancelIngredientSelection}
      />

      <BottomSummary
        totalCost={builder.totalCost}
        suggestedPrice={builder.suggestedPrice}
        profit={builder.profit}
        profitPercent={builder.profitPercent}
        onSave={builder.handleSave}
      />
    </AppShell>
  );
}
