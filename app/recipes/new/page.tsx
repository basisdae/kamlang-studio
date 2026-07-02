import AppShell from "../../../components/layout/AppShell";
import Card from "../../../components/ui/Card";

export default function NewRecipePage() {
  return (
    <AppShell
      title="สร้างเมนูใหม่"
      description="เริ่มจากชื่อเมนูและหมวดหมู่ก่อน แล้วค่อยทำสูตรเพื่อให้ระบบแนะนำราคา"
      backHref="/recipes"
    >
      <Card className="space-y-4">
        <div>
          <label className="text-sm font-bold text-black/50">ชื่อเมนู</label>
          <input
            className="mt-2 w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 outline-none"
            placeholder="เช่น กะเพราเนื้อ"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-black/50">หมวดหมู่</label>
          <input
            className="mt-2 w-full rounded-2xl bg-[#f7f2ea] px-4 py-3 outline-none"
            placeholder="เช่น เมนูขายดี"
          />
        </div>

        <div className="rounded-2xl bg-[#fff7e8] p-4 text-sm leading-6 text-black/60">
          ยังไม่ต้องใส่ราคาขายตอนนี้ ระบบจะแนะนำราคาให้หลังจากเพิ่มวัตถุดิบ
          และคำนวณต้นทุนแล้ว
        </div>

        <button className="w-full rounded-2xl bg-[#2b2118] py-4 font-bold text-white active:scale-[0.98]">
          สร้างเมนู
        </button>
      </Card>
    </AppShell>
  );
}