import { Plus } from "lucide-react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import EmptyState from "../../../../components/ui/EmptyState";
import { EMPTY_STATE } from "../../../copy/emptyStates";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../../components/layout/navConfig";
import type { RecipeLinesProps } from "../types";
export default function RecipeLines({
  lines,
  ingredientsError,
  onRemoveLine,
  onEditLine,
  onAddIngredient,
}: RecipeLinesProps) {
  return (
    <Card className="space-y-3">
      <div className="kl-type-card-title">รายการในสูตร</div>

      {ingredientsError && (
        <div className="kl-type-caption text-kl-danger-text">{ingredientsError}</div>
      )}

      {lines.length === 0 ? (
        <EmptyState {...EMPTY_STATE.recipe.builderLines} />
      ) : (
        lines.map((item, index) => (
          <div
            key={`${item.ingredientId}-${index}`}
            className="flex items-center justify-between border-b border-kl-border pb-3 last:border-0 last:pb-0"
          >
            <button
              type="button"
              onClick={() => onEditLine(index)}
              className="min-w-0 flex-1 text-left kl-pressable"
            >
              <div className="kl-type-card-title">{item.name}</div>
              <div className="kl-type-caption mt-1">
                {item.quantity} {item.unit}
              </div>
            </button>

            <div className="flex items-center gap-3">
              <div className="kl-type-metric">฿{item.cost.toFixed(2)}</div>
              <button
                type="button"
                onClick={() => onRemoveLine(index)}
                className="kl-type-caption text-kl-muted kl-pressable"
              >
                ลบ
              </button>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={onAddIngredient}
      >
        <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        เพิ่มวัตถุดิบ
      </Button>    </Card>
  );
}
