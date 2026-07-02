import AppShell from "../../../components/layout/AppShell";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export default function NewRecipePage() {
  return (
    <AppShell
      title="สร้างเมนูขาย"
      description="ใช้สูตรที่มีอยู่เพื่อสร้างสินค้าที่ขายจริง"
      backHref="/recipes"
    >
      <Card className="space-y-4">
        <div>
          <label className="kl-type-label">ชื่อเมนูขาย</label>
          <input
            className="kl-input mt-2"
            placeholder="เช่น กะเพราเนื้อ"
          />
        </div>

        <div>
          <label className="kl-type-label">หมวดหมู่</label>
          <input
            className="kl-input mt-2"
            placeholder="เช่น เมนูขายดี"
          />
        </div>

        <p className="kl-type-helper rounded-2xl bg-kl-surface p-4">
          ยังไม่ต้องใส่ราคาขายตอนนี้ ระบบจะแนะนำราคาให้หลังจากเพิ่มวัตถุดิบ
          และคำนวณต้นทุนแล้ว
        </p>

        <Button fullWidth>สร้างเมนูขาย</Button>
      </Card>
    </AppShell>
  );
}
