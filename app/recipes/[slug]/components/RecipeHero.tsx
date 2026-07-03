import { Soup } from "lucide-react";
import {
  KL_ICON_DISPLAY_LG_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Card from "../../../../components/ui/Card";import Badge from "../../../../components/ui/Badge";
import StatCell from "../../../../components/ui/StatCell";
import type { Recipe } from "../../types";
import { formatRecipeStatus } from "../../utils";

type Props = {
  recipe: Recipe;
};

export default function RecipeHero({ recipe }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex aspect-[16/10] items-center justify-center bg-kl-surface">
        <Soup
          className={`${KL_ICON_DISPLAY_LG_CLASS} text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
        />
      </div>

      <div className="space-y-5 kl-card-body">
        <div className="flex items-start justify-end gap-3">
          <Badge
            tone={
              recipe.status === "พร้อมใช้"
                ? "ready"
                : recipe.status === "กำลังปรับ"
                  ? "inProgress"
                  : "draft"
            }
          >
            {formatRecipeStatus(recipe.status)}
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
      </div>
    </Card>
  );
}
