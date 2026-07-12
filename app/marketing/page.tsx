"use client";

import { Megaphone } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import WorkspaceLandingHeader from "../../components/workspaces/WorkspaceLandingHeader";
import ButtonLink from "../../components/ui/ButtonLink";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import SectionLink from "../../components/ui/SectionLink";

/**
 * Marketing landing — no mock campaigns / KPIs.
 * Only link to modules that already exist.
 */
export default function MarketingLandingPage() {
  return (
    <AppShell title="" hidePageHeader compact>
      <WorkspaceLandingHeader
        mark="📣"
        title="การตลาด"
        description="พื้นที่การตลาดกำลังเริ่มต้น"
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
    </AppShell>
  );
}
