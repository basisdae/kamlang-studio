"use client";

import { UtensilsCrossed } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

/**
 * Food menu catalog scaffold — separate from legacy kitchen /menus.
 * No prices, cost formulas, or mock SKUs in this round.
 */
export default function FoodMenuPage() {
  return (
    <AppShell title="เมนูอาหาร">
      <div className="min-w-0 space-y-3">
        <Card className="!p-4">
          <p className="kl-type-helper text-kl-muted">
            รายการเมนูสำหรับหน้าร้าน — ยังไม่มีแหล่งข้อมูลขายออนไลน์ในรอบนี้
          </p>
        </Card>

        <EmptyState
          icon={UtensilsCrossed}
          title="ยังไม่มีเมนูอาหาร"
          hint="เมื่อมีรายการและราคาจริง จะแสดงที่นี่ — ไม่ใส่ข้อมูลตัวอย่างใน Production"
        />

        <Card className="!p-3">
          <p className="kl-type-caption text-kl-muted">เตรียมไว้ภายหลัง</p>
          <ul className="mt-2 space-y-1 kl-type-helper text-kl-muted">
            <li>· ชื่อเมนู ราคา สถานะขาย</li>
            <li>· ผูกภาพจากคลังรูปภาพ</li>
            <li>· ยังไม่ทำสูตรต้นทุน สต๊อก หรือ CRUD เต็ม</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
