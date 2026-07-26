"use client";

import { ClipboardList, ShoppingBag } from "lucide-react";
import WorkspaceLandingHeader from "../workspaces/WorkspaceLandingHeader";
import ButtonLink from "../ui/ButtonLink";
import Card from "../ui/Card";

/**
 * Front-of-house landing — links to existing /order and /orders only.
 */
export default function FrontstoreLandingComposition() {
  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        title="ภาพรวม"
        description="สั่งอาหาร · คิวออเดอร์หน้าร้าน"
      />

      <Card className="!p-4">
        <p className="kl-type-helper text-kl-muted">
          เลือกทางเข้าด้านล่าง — หน้าสั่งอาหารและคิวออเดอร์ใช้เส้นทางเดิมของระบบ
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ButtonLink href="/order" fullWidth className="min-h-[52px]">
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="kl-icon" strokeWidth={1.75} aria-hidden />
            หน้าสั่งอาหาร
          </span>
        </ButtonLink>
        <ButtonLink
          href="/orders"
          variant="secondary"
          fullWidth
          className="min-h-[52px]"
        >
          <span className="inline-flex items-center gap-2">
            <ClipboardList className="kl-icon" strokeWidth={1.75} aria-hidden />
            ออเดอร์หน้าร้าน
          </span>
        </ButtonLink>
      </div>
    </div>
  );
}
