"use client";

import { useState } from "react";
import AppShell from "../../../components/layout/AppShell";
import BottomSummary from "./components/BottomSummary";
import HeaderForm from "./components/HeaderForm";
import IngredientPopup from "./components/IngredientPopup";
import RecipeLines from "./components/RecipeLines";
import RecipeNextStepSheet from "./components/RecipeNextStepSheet";
import VersionHistoryPanel from "../../../components/versionHistory/VersionHistoryPanel";
import Badge from "../../../components/ui/Badge";
import ButtonLink from "../../../components/ui/ButtonLink";
import {
  formatSavedRecipeStatus,
  normalizeSavedRecipeStatus,
  SAVED_RECIPE_STATUS_TONE,
} from "./status";
import { getSavedRecipeById } from "../../repositories/SavedRecipeRepository";
import { findMenuLinkedToRecipe } from "../importToMenu";
import { useRecipeBuilder } from "./hooks/useRecipeBuilder";

export default function RecipeBuilderPage() {
  const builder = useRecipeBuilder();
  const [nextStepRecipeId, setNextStepRecipeId] = useState<string | null>(null);

  const saved =
    builder.editingRecipeId != null
      ? getSavedRecipeById(builder.editingRecipeId)
      : undefined;
  const status = saved ? normalizeSavedRecipeStatus(saved) : null;
  const linkedMenu =
    builder.editingRecipeId != null
      ? findMenuLinkedToRecipe(builder.editingRecipeId)
      : undefined;

  return (
    <AppShell title="สร้างสูตร" backHref="/recipes" compact>
      <div className="space-y-4 kl-builder-scroll">
        {builder.editingRecipeId ? (
          <VersionHistoryPanel
            entityType="saved_recipe"
            entityId={builder.editingRecipeId}
            onRestored={() => window.location.reload()}
          />
        ) : null}

        {status ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={SAVED_RECIPE_STATUS_TONE[status]}>
              {formatSavedRecipeStatus({ status })}
            </Badge>
            {linkedMenu ? (
              <ButtonLink
                href={`/menus/${linkedMenu.id}/edit`}
                variant="secondary"
                className="!min-h-[2.25rem] !px-3 !text-[13px]"
              >
                เปิดเมนูที่เชื่อมอยู่
              </ButtonLink>
            ) : null}
          </div>
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
        onSaved={(id) => setNextStepRecipeId(id)}
      />

      {nextStepRecipeId ? (
        <RecipeNextStepSheet
          open
          recipeId={nextStepRecipeId}
          onClose={() => setNextStepRecipeId(null)}
          onContinueEditing={() => setNextStepRecipeId(null)}
        />
      ) : null}
    </AppShell>
  );
}
