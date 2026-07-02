import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import SectionTitle from "../../components/ui/SectionTitle";
import StatCell from "../../components/ui/StatCell";
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
  const selectedRecipe = getAllRecipes()[0];
  const foodOnlyCost = getStandardRecipeCost(selectedRecipe);
  const { labourCost, gasCost, electricityCost } = getPerPortionCosts();
  const totalCost =
    foodOnlyCost + packagingCost + labourCost + gasCost + electricityCost;
  const sellingPrice = getRecipeReferencePrice(selectedRecipe);
  const foodCost = getStandardRecipeFoodCost(totalCost, sellingPrice);
  const profit = sellingPrice - totalCost;
  const costLines = getStandardRecipeCostLines(selectedRecipe);

  return (
    <AppShell
      title="คำนวณราคา"
      description="คำนวณต้นทุนต่อเมนู ราคาขาย และกำไร"
      backHref="/"
    >
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kl-type-label">เมนูที่เลือก</p>
            <h2 className="kl-type-display mt-1.5">
              {selectedRecipe.name}
            </h2>
          </div>

          <Badge tone="success">พร้อมขาย</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <StatCell label="ต้นทุน" value={`฿${totalCost}`} size="lg" />
          <StatCell label="ขาย" value={`฿${sellingPrice}`} size="lg" />
          <StatCell label="กำไร" value={`฿${profit}`} size="lg" />
        </div>      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="kl-type-label">สัดส่วนต้นทุนอาหาร</div>
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

        <p className="kl-type-description">
          เป้าหมายแนะนำคือสัดส่วนต้นทุนอาหารประมาณ 30–35% ถ้าสูงกว่านี้ควรปรับราคาขาย
          หรือทบทวนต้นทุนวัตถุดิบ
        </p>
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

              <div className="kl-type-metric text-kl-brown">
                ฿{item.cost}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-kl-border pt-3">
            <div>
              <div className="kl-type-body">บรรจุภัณฑ์</div>
              <div className="kl-type-caption mt-1">
                กล่อง / ถุง / ช้อน
              </div>
            </div>

            <div className="kl-type-metric text-kl-brown">
              ฿{packagingCost}
            </div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
