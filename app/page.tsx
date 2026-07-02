import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import SectionTitle from "@/components/ui/SectionTitle";

const menuGroups = [
  {
    title: "จัดการสูตร",
    items: [
      { title: "สูตรอาหาร", desc: "เมนูหลักของร้าน", icon: "🍔", href: "/recipes" },
      { title: "สูตรซอส", desc: "ซอสกลาง / น้ำปรุง", icon: "🥣", href: "/sauces" },
      { title: "วัตถุดิบ", desc: "ราคา หน่วย Supplier", icon: "🥩", href: "/ingredients" },
    ],
  },
  {
    title: "คำนวณร้าน",
    items: [
      { title: "Packaging", desc: "กล่อง ถุง ช้อน ซอง", icon: "📦", href: "/packaging" },
      { title: "คำนวณราคา", desc: "ต้นทุน GP ราคาขาย", icon: "💰", href: "/costing" },
      { title: "Export PDF", desc: "ส่งออกสูตร / ใบต้นทุน", icon: "📄", href: "/export" },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { title: "ตั้งค่า", desc: "ข้อมูลร้านและระบบ", icon: "⚙️", href: "/settings" },
    ],
  },
];

export default function HomePage() {
  return (
    <AppShell
      title="Kitchen Library"
      description="ระบบเก็บสูตร วัตถุดิบ และคำนวณต้นทุน สำหรับครัวเข้าเนื้อ"
    >
      <Card className="bg-[#2b2118] text-white">
        <p className="text-sm text-white/60">KL App V3</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight">
          ครัวเป็นระบบขึ้นทุกวัน
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/70">
          เริ่มจากสูตรอาหาร แล้วต่อยอดไปถึงต้นทุน สต็อก และราคาขาย
        </p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <div className="text-xl font-bold">127</div>
          <div className="mt-1 text-xs text-black/45">สูตร</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold">89</div>
          <div className="mt-1 text-xs text-black/45">วัตถุดิบ</div>
        </Card>

        <Card className="text-center">
          <div className="text-xl font-bold">35%</div>
          <div className="mt-1 text-xs text-black/45">Food cost</div>
        </Card>
      </div>

      {menuGroups.map((group) => (
        <section key={group.title} className="space-y-3">
          <SectionTitle>{group.title}</SectionTitle>

          <div className="space-y-3">
            {group.items.map((item) => (
              <Link key={item.title} href={item.href}>
                <Card className="flex items-center gap-4 active:scale-[0.98]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e5d3] text-2xl">
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <div className="font-bold">{item.title}</div>
                    <div className="mt-1 text-sm text-black/45">
                      {item.desc}
                    </div>
                  </div>

                  <div className="text-xl text-black/30">›</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}