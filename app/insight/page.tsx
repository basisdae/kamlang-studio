import { Lightbulb } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import EmptyState from "../../components/ui/EmptyState";
import ButtonLink from "../../components/ui/ButtonLink";

/**
 * Business Insight — Observer / Analysis layer.
 * Reads Shared Core; does not own data or duplicate Module forms.
 * Outside Workspace → Landing → Module.
 */
export default function InsightPage() {
  return (
    <AppShell
      title="Business Insight"
      description="Observer · อ่านจาก Shared Core"
      compact
    >
      <EmptyState
        icon={Lightbulb}
        title="Insight กำลังจะมา"
        hint="ชั้นวิเคราะห์ของแพลตฟอร์ม — อ่านและสรุปจาก Shared Core ไม่สร้างฟอร์มซ้ำกับ Module และไม่อยู่ในสาย Workspace"
        actionLabel="เลือก Workspace"
        actionHref="/modes"
      />
      <ButtonLink href="/opening" variant="secondary" fullWidth>
        ไป Opening Landing
      </ButtonLink>
    </AppShell>
  );
}
