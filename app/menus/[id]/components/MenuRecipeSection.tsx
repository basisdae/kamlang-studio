import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";import Card from "../../../../components/ui/Card";
import SectionTitle from "../../../../components/ui/SectionTitle";
import type { Recipe } from "../../../recipes/types";

type Props = {
  recipe: Recipe;
};

export default function MenuRecipeSection({ recipe }: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="menus">สูตรที่ใช้</SectionTitle>

      <Link href={`/recipes/${recipe.slug}`} className="block kl-pressable">
        <Card className="flex items-center justify-between gap-3">
          <div>
            <div className="kl-type-card-title">{recipe.name}</div>
          </div>

          <ChevronRight
            className={`${KL_ICON_CLASS} shrink-0 text-kl-muted`}
            strokeWidth={KL_ICON_STROKE}
          />
        </Card>
      </Link>
    </section>
  );
}
