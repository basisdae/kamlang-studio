import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import Badge from "../../components/ui/Badge";

const ingredients = [
  { name: "หมูสับ", unit: "กิโลกรัม", price: 180, supplier: "ตลาด", status: "ปกติ" },
  { name: "ใบกะเพรา", unit: "กำ", price: 10, supplier: "ตลาด", status: "ราคาขึ้น" },
  { name: "พริกกระเทียม", unit: "กิโลกรัม", price: 90, supplier: "ตลาด", status: "ปกติ" },
  { name: "ซอสผัด", unit: "ลิตร", price: 65, supplier: "สูตรร้าน", status: "สูตรกลาง" },
];

export default function IngredientsPage() {
  return (
    <AppShell
      title="วัตถุดิบ"
      description="ฐานข้อมูลราคา หน่วย และแหล่งซื้อ"
      backHref="/"
    >
      <SearchBar placeholder="ค้นหาวัตถุดิบ..." />

      <div className="space-y-3">
        {ingredients.map((item) => (
          <Card key={item.name} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{item.name}</h2>
                <p className="mt-1 text-sm text-black/45">
                  {item.supplier} / {item.unit}
                </p>
              </div>

              <Badge
                tone={
                  item.status === "ราคาขึ้น"
                    ? "warning"
                    : item.status === "สูตรกลาง"
                    ? "info"
                    : "success"
                }
              >
                {item.status}
              </Badge>
            </div>

            <div className="rounded-2xl bg-[#f7f2ea] p-4">
              <div className="text-xs text-black/40">ราคาต่อหน่วย</div>
              <div className="mt-1 text-xl font-bold">฿{item.price}</div>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}