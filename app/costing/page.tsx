import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import {
  recipes,
  getRecipeCost,
  getFoodCostPercent,
} from "../data/recipes";

const selectedRecipe = recipes[0];
const packagingCost = 5;

export default function CostingPage() {
  const foodOnlyCost = getRecipeCost(selectedRecipe);
  const totalCost = foodOnlyCost + packagingCost;
  const sellingPrice = selectedRecipe.price;
  const foodCost = Math.round((totalCost / sellingPrice) * 100);
  const profit = sellingPrice - totalCost;

  return (
    <AppShell
      title="คำนวณราคา"
      description="คำนวณต้นทุนต่อเมนู ราคาขาย และกำไร"
      backHref="/"
    >
      <Card className="space-y-4 bg-[#2b2118] text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/55">เมนูที่เลือก</p>
            <h2 className="mt-1 text-2xl font-bold">
              {selectedRecipe.name}
            </h2>
          </div>

          <Badge tone="success">พร้อมขาย</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-xs text-white/45">ต้นทุน</div>
            <div className="mt-1 font-bold">฿{totalCost}</div>
          </div>

          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-xs text-white/45">ขาย</div>
            <div className="mt-1 font-bold">฿{sellingPrice}</div>
          </div>

          <div className="rounded-2xl bg-white/10 p-3">
            <div className="text-xs text-white/45">กำไร</div>
            <div className="mt-1 font-bold">฿{profit}</div>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-black/45">Food Cost</div>
            <div className="mt-1 text-3xl font-bold">{foodCost}%</div>
          </div>

          <Badge tone={foodCost <= 35 ? "success" : "warning"}>
            {foodCost <= 35 ? "ดี" : "ควรปรับ"}
          </Badge>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#f1e5d3]">
          <div
            className="h-full rounded-full bg-[#2b2118]"
            style={{ width: `${Math.min(foodCost, 100)}%` }}
          />
        </div>

        <p className="text-sm leading-6 text-black/50">
          เป้าหมายแนะนำคือ Food Cost ประมาณ 30–35% ถ้าสูงกว่านี้ควรปรับราคาขาย
          หรือทบทวนต้นทุนวัตถุดิบ
        </p>
      </Card>

      <section className="space-y-3">
        <h2 className="px-1 text-sm font-bold text-black/45">
          รายการต้นทุน
        </h2>

        <Card className="space-y-3">
          {selectedRecipe.ingredients.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between border-b border-black/5 pb-3 last:border-0 last:pb-0"
            >
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="mt-1 text-sm text-black/45">{item.amount}</div>
              </div>

              <div className="font-bold">฿{item.cost}</div>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-black/10 pt-3">
            <div>
              <div className="font-bold">Packaging</div>
              <div className="mt-1 text-sm text-black/45">
                กล่อง / ถุง / ช้อน
              </div>
            </div>

            <div className="font-bold">฿{packagingCost}</div>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}