import Link from "next/link";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import Badge from "../../components/ui/Badge";
import { coreRecipes } from "../data/recipeCore";
import {
  getRecipeCoreCost,
  getRecipeCoreFoodCost,
} from "../lib/costService";

export default function RecipesPage() {
  return (
    <AppShell
      title="สูตรอาหาร"
      description="รวมสูตรเมนูหลัก ต้นทุน และราคาขาย"
      backHref="/"
    >
      <SearchBar placeholder="ค้นหาสูตรอาหาร..." />
      <Link href="/recipes/new">
  <Card className="flex items-center justify-center gap-3 border-2 border-dashed border-[#d8b98a] bg-[#fffaf2] text-[#2b2118] active:scale-[0.98]">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b2118] text-xl font-bold text-white">
      +
    </div>
    <div className="font-bold">สร้างเมนูใหม่</div>
  </Card>
</Link>

      <div className="space-y-3">
        {coreRecipes.map((recipe) => {
          const cost = getRecipeCoreCost(recipe);
          const foodCost = getRecipeCoreFoodCost(recipe);

          return (
            <Link key={recipe.slug} href={`/recipes/${recipe.slug}`}>
              <Card className="space-y-3 active:scale-[0.98]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{recipe.name}</h2>
                    <p className="mt-1 text-sm text-black/45">
                      {recipe.category}
                    </p>
                  </div>

                  <Badge
                    tone={
                      recipe.status === "พร้อมใช้"
                        ? "success"
                        : recipe.status === "กำลังปรับ"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {recipe.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-[#f7f2ea] p-3">
                    <div className="text-xs text-black/40">ต้นทุน</div>
                    <div className="mt-1 font-bold">฿{cost}</div>
                  </div>

                  <div className="rounded-2xl bg-[#f7f2ea] p-3">
                    <div className="text-xs text-black/40">ขาย</div>
                    <div className="mt-1 font-bold">
                      ฿{recipe.sellingPrice}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f7f2ea] p-3">
                    <div className="text-xs text-black/40">FC</div>
                    <div className="mt-1 font-bold">{foodCost}%</div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}