import { Lightbulb } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import ButtonLink from "../../components/ui/ButtonLink";
import Card from "../../components/ui/Card";

/**
 * Business Insight — Observer / Analysis / Command Center.
 * Reads Shared Core; does not own data or duplicate Module forms.
 * Outside Workspace → Landing → Module.
 */
export default function InsightPage() {
  return (
    <AppShell
      title="Business Insight"
      description="Command Center · Observer Layer"
      compact
    >
      <Card className="space-y-2 !p-4">
        <p className="kl-type-card-title">บทบาทใน Architecture</p>
        <ul className="kl-type-helper list-disc space-y-1 pl-5">
          <li>อ่านและวิเคราะห์จาก Shared Core</li>
          <li>ไม่เป็นเจ้าของข้อมูล · ไม่สร้างฟอร์มซ้ำกับ Module</li>
          <li>อยู่นอกสาย Workspace → Landing → Module</li>
        </ul>
      </Card>

      <EmptyState
        icon={Lightbulb}
        title="Insight กำลังจะมา"
        hint="รอบนี้ยังไม่มีแดชบอร์ดวิเคราะห์ — จะต่อบน Shared Core โดยไม่แยก Database ตาม Workspace"
        actionLabel="เลือก Workspace"
        actionHref="/modes"
      />
      <ButtonLink href="/modes" variant="secondary" fullWidth>
        กลับไป Chooser
      </ButtonLink>
    </AppShell>
  );
}
