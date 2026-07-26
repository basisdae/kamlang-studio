"use client";

import { Images } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";

/**
 * Media library scaffold — no upload, no mock assets.
 */
export default function MediaLibraryPage() {
  return (
    <AppShell title="คลังรูปภาพ">
      <div className="min-w-0 space-y-3">
        <Card className="!p-4">
          <p className="kl-type-helper text-kl-muted">
            เก็บรูปสินค้าและสื่อสำหรับเมนู — ยังไม่เชื่อมที่เก็บไฟล์ในรอบนี้
          </p>
        </Card>

        <EmptyState
          icon={Images}
          title="ยังไม่มีรูปในคลัง"
          hint="เตรียมพื้นที่ไว้สำหรับเพิ่มรูปภายหลัง เมื่อมีแหล่งเก็บไฟล์จริง"
        />

        <Card className="!p-3">
          <p className="kl-type-caption text-kl-muted">เตรียมไว้ภายหลัง</p>
          <ul className="mt-2 space-y-1 kl-type-helper text-kl-muted">
            <li>· อัปโหลดและจัดหมวดหมู่รูป</li>
            <li>· เลือกใช้กับเมนูอาหาร</li>
            <li>· ยังไม่ผูกกับเมนูในรอบนี้</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
