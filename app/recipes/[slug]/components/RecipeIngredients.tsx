"use client";

import type { ReactNode } from "react";
import Card from "../../../../components/ui/Card";
import EmptyState from "../../../../components/ui/EmptyState";
import SectionTitle from "../../../../components/ui/SectionTitle";
import { EMPTY_STATE } from "../../../copy/emptyStates";
import type { DisplayRecipeLine } from "../scaling";
import { formatRecipeUnit } from "../utils";

type Props = {
  displayLines: DisplayRecipeLine[];
  batchControl: ReactNode;
  onLineClick: (lineIndex: number) => void;
};

export default function RecipeIngredients({
  displayLines,
  batchControl,
  onLineClick,
}: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between px-1">
        <SectionTitle module="recipes">วัตถุดิบ</SectionTitle>
        {displayLines.length > 0 ? (
          <span className="kl-type-label text-kl-muted">
            {displayLines.length} รายการ
          </span>
        ) : null}
      </div>

      {batchControl}

      {displayLines.length === 0 ? (
        <EmptyState
          {...EMPTY_STATE.recipe.ingredients}
          className="py-10"
        />
      ) : (
        <Card className="!p-0">
          <div className="kl-list p-2">
          {displayLines.map((line) => (
            <button
              key={line.lineIndex}
              type="button"
              onClick={() => onLineClick(line.lineIndex)}
              className="flex min-h-[60px] w-full items-center justify-between gap-4 rounded-[var(--kl-radius-btn)] px-3 py-3 text-left kl-pressable active:bg-kl-surface"
            >
              <div className="min-w-0 flex-1">
                <div className="kl-type-card-title">{line.name}</div>
                {line.note ? (
                  <p className="kl-type-helper mt-1">{line.note}</p>
                ) : null}
              </div>

              <div className="shrink-0 text-right">
                <span className="kl-type-metric-lg leading-none">
                  {line.quantity}
                </span>
                <span className="kl-type-label mt-0.5 block text-kl-muted">
                  {formatRecipeUnit(line.unit)}
                </span>
              </div>
            </button>
          ))}
          </div>
        </Card>
      )}
    </section>
  );
}
