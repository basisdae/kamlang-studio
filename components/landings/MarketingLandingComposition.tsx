"use client";

import { Megaphone } from "lucide-react";
import WorkspaceLandingHeader from "../workspaces/WorkspaceLandingHeader";
import ButtonLink from "../ui/ButtonLink";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import SectionLink from "../ui/SectionLink";

/**
 * Marketing Landing Composition — Campaign empty + Timeline / Documents previews.
 * No mock campaigns.
 */
export default function MarketingLandingComposition() {
  return (
    <div className="min-w-0 space-y-3">
      <WorkspaceLandingHeader
        title="ภาพรวม"
        description="แคมเปญ · Timeline · เอกสาร"
      />

      <EmptyState
        icon={Megaphone}
        title="ยังไม่มีแคมเปญ"
        hint="ยังไม่มีโมดูลแผนการตลาดในระบบ — เพิ่มเมื่อ Module พร้อม ไม่สร้างข้อมูลหลอก"
      />

      <Card className="space-y-1 !p-2">
        <p className="kl-type-caption px-2 pt-1">โมดูลที่มีอยู่</p>
        <SectionLink variant="nav" href="/timeline" title="Timeline" />
        <SectionLink
          variant="nav"
          href="/opening/documents"
          title="เอกสาร"
        />
        <SectionLink
          variant="nav"
          href="/opening/calendar"
          title="ไทม์ไลน์เปิดร้าน"
        />
      </Card>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ButtonLink href="/timeline" fullWidth>
          ดู Timeline
        </ButtonLink>
        <ButtonLink href="/opening/documents" variant="secondary" fullWidth>
          ดูเอกสาร
        </ButtonLink>
      </div>
    </div>
  );
}
