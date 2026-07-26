"use client";

import { Boxes, Images, UtensilsCrossed } from "lucide-react";
import WorkspaceLandingHeader from "../workspaces/WorkspaceLandingHeader";
import ButtonLink from "../ui/ButtonLink";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";

/**
 * Back-of-house landing — scaffolds for media library and food menu.
 */
export default function BackstoreLandingComposition() {
  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        title="ภาพรวม"
        description="คลังรูปภาพ · เมนูอาหาร"
      />

      <EmptyState
        icon={Boxes}
        title="เริ่มจากคลังรูปหรือเมนูอาหาร"
        hint="รอบนี้เป็นโครงหน้าเท่านั้น — ยังไม่มีข้อมูลจริงและยังไม่อัปโหลดรูป"
      />

      <Card className="!p-3">
        <p className="kl-type-caption text-kl-muted">ทางเข้าหลัก</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ButtonLink href="/media" fullWidth className="min-h-[48px]">
            <span className="inline-flex items-center gap-2">
              <Images className="kl-icon" strokeWidth={1.75} aria-hidden />
              คลังรูปภาพ
            </span>
          </ButtonLink>
          <ButtonLink
            href="/food-menu"
            variant="secondary"
            fullWidth
            className="min-h-[48px]"
          >
            <span className="inline-flex items-center gap-2">
              <UtensilsCrossed
                className="kl-icon"
                strokeWidth={1.75}
                aria-hidden
              />
              เมนูอาหาร
            </span>
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
