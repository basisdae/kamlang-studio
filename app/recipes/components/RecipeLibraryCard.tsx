import Link from "next/link";
import Card from "../../../components/ui/Card";
import StatCell from "../../../components/ui/StatCell";
import type { Recipe } from "../types";

type Props = {
  recipe: Recipe;
  totalCost: number;
  suggestedPrice: number;
};

export default function RecipeLibraryCard({
  recipe,
  totalCost,
  suggestedPrice,
}: Props) {
  const profit = suggestedPrice - totalCost;

  return (
    <Card className="space-y-3">
      <Link href={`/recipes/${recipe.slug}`} className="block kl-pressable">
        <div>
          <h2 className="kl-type-card-title">{recipe.name}</h2>
          {recipe.category ? (
            <p className="kl-type-caption mt-1">{recipe.category}</p>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCell label="ต้นทุน" value={`฿${totalCost}`} />
          <StatCell label="ขาย" value={`฿${suggestedPrice}`} />
          <StatCell label="กำไร" value={`฿${profit}`} />
        </div>
      </Link>
    </Card>
  );
}
