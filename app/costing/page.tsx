import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SectionTitle from "../../components/ui/SectionTitle";
import StatCell from "../../components/ui/StatCell";
import EmptyState from "../../components/ui/EmptyState";
import ButtonLink from "../../components/ui/ButtonLink";
import { Calculator } from "lucide-react";
import {
  getStandardRecipeCost,
  getStandardRecipeCostLines,
  getStandardRecipeFoodCost,
  getRecipeReferencePrice,
} from "../lib/costService";
import { getAllRecipes } from "../recipes/RecipeRepository";
import { getPerPortionCosts } from "../settings/pricingAccess";

const packagingCost = 5;

export default function CostingPage() {
  const recipes = getAllRecipes();
  const selectedRecipe = recipes[0];

  if (!selectedRecipe) {
    return (
      <AppShell title="คำนวณราคา" backHref="/home" compact>
        <EmptyState
          icon={Calculator}
          title="ยังไม่มีสูตรให้คำนวณต้นทุน"
          hint="สร้างสูตรใน Recipe Builder ก่อน แล้วกลับมาดูต้นทุนที่นี่"
          actionLabel="สร้างสูตร"
          actionHref="/recipes/builder"
        />
        <ButtonLink href="/recipes" variant="secondary" fullWidth>
          ดูรายการสูตร
        </ButtonLink>
      </AppShell>
    );
  }

  const foodOnlyCost = getStandardRecipeCost(selectedRecipe);
  const { labourCost, gasCost, electricityCost } = getPerPortionCosts();
  const totalCost =
    foodOnlyCost + packagingCost + labourCost + gasCost + electricityCost;
  const sellingPrice = getRecipeReferencePrice(selectedRecipe);
  const foodCost = getStandardRecipeFoodCost(totalCost, sellingPrice);
  const profit = sellingPrice - totalCost;
  const costLines = getStandardRecipeCostLines(selectedRecipe);

  return (
    <AppShell title="คำนวณราคา" backHref="/home" compact>
      <Card className="space-y-4">
        <h2 className="kl-type-display">{selectedRecipe.name}</h2>

        <div className="grid grid-cols-3 gap-2.5">
          <StatCell label="ต้นทุน" value={`฿${totalCost}`} size="lg" />
          <StatCell label="ขาย" value={`฿${sellingPrice}`} size="lg" />
          <StatCell label="กำไร" value={`฿${profit}`} size="lg" />
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="kl-type-label">ต้นทุนวัตถุดิบเทียบราคาขาย</div>
            <div className="kl-type-metric-xl mt-1.5 text-kl-brown">
              {foodCost}%
            </div>
          </div>

          <Badge tone={foodCost <= 35 ? "success" : "warning"}>
            {foodCost <= 35 ? "ดี" : "ควรปรับ"}
          </Badge>
        </div>

        <div className="kl-progress-track h-2">
          <div
            className="kl-progress-fill"
            style={{ width: `${Math.min(foodCost, 100)}%` }}
          />
        </div>

        <p className="kl-type-caption">เป้า 30–35%</p>
      </Card>

      <section className="space-y-3">
        <SectionTitle>รายการต้นทุน</SectionTitle>

        <Card className="space-y-3">
          {costLines.map((item) => (
            <div
              key={`${item.name}-${item.quantity}-${item.unit}`}
              className="flex items-center justify-between border-b border-kl-border pb-3 last:border-0 last:pb-0"
            >
              <div>
                <div className="kl-type-body">{item.name}</div>
                <div className="kl-type-caption mt-1">
                  {item.quantity} {item.unit}
                </div>
              </div>

              <div className="kl-type-metric text-kl-brown">฿{item.cost}</div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-kl-border pt-3">
            <div>
              <div className="kl-type-body">ของห่อกลับบ้าน</div>
              <div className="kl-type-caption mt-1">กล่อง / ถุง / ช้อน</div>
            </div>

            <div className="kl-type-metric text-kl-brown">฿{packagingCost}</div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
