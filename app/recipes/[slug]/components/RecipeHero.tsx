import { Soup } from "lucide-react";
import {
  KL_ICON_DISPLAY_LG_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Card from "../../../../components/ui/Card";import Badge from "../../../../components/ui/Badge";
import StatCell from "../../../../components/ui/StatCell";
import type { Recipe } from "../../types";

type Props = {
  recipe: Recipe;
};

export default function RecipeHero({ recipe }: Props) {
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex aspect-[16/10] items-center justify-center bg-kl-surface">
        <Soup
          className={`${KL_ICON_DISPLAY_LG_CLASS} text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
        />
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="kl-type-display">{recipe.name}</h2>
            {recipe.category ? (
              <p className="kl-type-description mt-1.5">{recipe.category}</p>
            ) : null}
          </div>

          <Badge
            tone={
              recipe.status === "พร้อมใช้"
                ? "ready"
                : recipe.status === "กำลังปรับ"
                  ? "inProgress"
                  : "draft"
            }
          >
            {recipe.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <StatCell
            label="เตรียม"
            value={
              <>
                {recipe.prepTimeMinutes}
                <span className="kl-type-label ml-0.5">นาที</span>
              </>
            }
          />
          <StatCell
            label="ปรุง"
            value={
              <>
                {recipe.cookTimeMinutes}
                <span className="kl-type-label ml-0.5">นาที</span>
              </>
            }
          />
          <StatCell
            label="ปริมาณ"
            value={
              <>
                {recipe.yieldQuantity}
                <span className="kl-type-label ml-0.5">{recipe.yieldUnit}</span>
              </>
            }
          />
        </div>

        {totalTime > 0 ? (
          <p className="kl-type-helper text-center">
            รวมเวลาประมาณ {totalTime} นาที
          </p>
        ) : null}
      </div>
    </Card>
  );
}
