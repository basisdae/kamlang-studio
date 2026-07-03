"use client";

import { useEffect, useMemo, useState } from "react";
import type { RecipeLine } from "../../types";
import { getEstimatedGpPercent } from "../utils";
import {
  buildDisplayLines,
  getScaledTotalCost,
  type DisplayRecipeLine,
  type LineOverride,
} from "../scaling";
import { loadDetailDraft, saveDetailDraft } from "../detailSave";
import BatchSizeControl from "./BatchSizeControl";
import RecipeIngredients from "./RecipeIngredients";
import RecipeCostSummary from "./RecipeCostSummary";
import IngredientLineEditor from "./IngredientLineEditor";

const SAVED_CONFIRMATION_MS = 1000;

type Props = {
  recipeId: string;
  recipeName: string;
  recipeCategory: string;
  lines: RecipeLine[];
  yieldUnit: string;
  suggestedPrice: number;
  showSave?: boolean;
};

export default function RecipeScaledSections({
  recipeId,
  recipeName,
  recipeCategory,
  lines,
  yieldUnit,
  suggestedPrice,
  showSave = true,
}: Props) {
  const [batchSize, setBatchSize] = useState(1);
  const [overrides, setOverrides] = useState<Record<number, LineOverride>>({});
  const [activeLineIndex, setActiveLineIndex] = useState<number | null>(null);
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);

  useEffect(() => {
    const draft = loadDetailDraft(recipeId);
    if (!draft) return;

    setBatchSize(draft.batchSize);
    setOverrides(draft.overrides);
  }, [recipeId]);

  useEffect(() => {
    if (!showSavedConfirmation) return;

    const timer = setTimeout(
      () => setShowSavedConfirmation(false),
      SAVED_CONFIRMATION_MS
    );

    return () => clearTimeout(timer);
  }, [showSavedConfirmation]);

  const displayLines = useMemo(
    () => buildDisplayLines(lines, batchSize, overrides),
    [lines, batchSize, overrides]
  );

  const ingredientCost = useMemo(
    () => getScaledTotalCost(displayLines),
    [displayLines]
  );
  const gpPercent = getEstimatedGpPercent(ingredientCost, suggestedPrice);

  const activeLine: DisplayRecipeLine | null =
    activeLineIndex === null
      ? null
      : (displayLines.find((line) => line.lineIndex === activeLineIndex) ?? null);

  function handleLineUpdate(lineIndex: number, override: LineOverride) {
    setOverrides((current) => ({
      ...current,
      [lineIndex]: override,
    }));
  }

  function changeBatchSize(next: number) {
    setBatchSize((current) => {
      if (current !== next) {
        setOverrides({});
        setActiveLineIndex(null);
      }

      return next;
    });
  }

  function handleSave(): boolean {
    saveDetailDraft({
      recipeId,
      recipeName,
      recipeCategory,
      batchSize,
      overrides,
      displayLines,
      ingredientCost,
      suggestedPrice,
    });
    setShowSavedConfirmation(true);
    return true;
  }

  return (
    <div className="space-y-7">
      <RecipeIngredients
        displayLines={displayLines}
        batchControl={
          <BatchSizeControl
            batchSize={batchSize}
            yieldUnit={yieldUnit}
            onDecrease={() => changeBatchSize(Math.max(1, batchSize - 1))}
            onIncrease={() => changeBatchSize(batchSize + 1)}
          />
        }
        onLineClick={setActiveLineIndex}
      />

      <RecipeCostSummary
        ingredientCost={ingredientCost}
        suggestedPrice={suggestedPrice}
        gpPercent={gpPercent}
        onSave={showSave ? handleSave : undefined}
        showSavedConfirmation={showSavedConfirmation}
      />

      <IngredientLineEditor
        line={activeLine}
        isOpen={activeLineIndex !== null}
        onClose={() => setActiveLineIndex(null)}
        onUpdate={handleLineUpdate}
      />
    </div>
  );
}
