import { getPricesByRecipeId } from "../../lib/pricingService";
import { notFound } from "next/navigation";
import AppShell from "../../../components/layout/AppShell";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { coreRecipes } from "../../data/recipeCore";
import {
  getRecipeCoreCost,
  getRecipeCoreFoodCost,
  getSuggestedSellingPrice,
  getRecipeCostLines,
} from "../../lib/costService";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function RecipeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const recipe = coreRecipes.find((item) => item.slug === slug);

  if (!recipe) {
    notFound();
  }

  const cost = getRecipeCoreCost(recipe);
  const foodCost = getRecipeCoreFoodCost(recipe);
  const suggestedPrice = getSuggestedSellingPrice(recipe);
  const prices = getPricesByRecipeId(recipe.id);

  return (
    <AppShell title={recipe.name} description={recipe.category} backHref="/recipes">
      <Card className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-black/45">สถานะสูตร</p>
            <h2 className="mt-1 text-xl font-bold">{recipe.name}</h2>
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
            <div className="text-xs text-black/40">แนะนำ</div>
            <div className="mt-1 font-bold">฿{suggestedPrice}</div>
          </div>

          <div className="rounded-2xl bg-[#f7f2ea] p-3">
            <div className="text-xs text-black/40">FC</div>
            <div className="mt-1 font-bold">{foodCost}%</div>
          </div>
        </div>
      </Card>

            <section className="space-y-3">
        <h2 className="px-1 text-sm font-bold text-black/45">
          ราคาขายแต่ละช่องทาง
        </h2>

        <Card className="space-y-3">
          {prices.map((item) => (
            <div
              key={item.channel}
              className="flex items-center justify-between border-b border-black/5 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <div className="font-bold">{item.channel}</div>
                <div className="mt-1 text-sm text-black/45">
                  {item.price ? "ตั้งราคาแล้ว" : "ยังไม่ได้ตั้งราคา"}
                </div>
              </div>

              <div className="font-bold">
                {item.price ? `฿${item.price}` : "—"}
              </div>
            </div>
          ))}
        </Card>
      </section>

      {/* แล้วค่อยเป็นวัตถุดิบ */}

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-bold text-black/45">วิธีทำ</h2>

        <Card className="space-y-4">
          {recipe.steps.map((step, index) => (
            <div key={step} className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2b2118] text-sm font-bold text-white">
                {index + 1}
              </div>

              <p className="pt-1 text-sm leading-6 text-black/70">{step}</p>
            </div>
          ))}
        </Card>
      </section>
    </AppShell>
  );
}