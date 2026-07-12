import { Lightbulb } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import DataSourceBadge from "../../components/bi/DataSourceBadge";
import { OPENING_DATA_SOURCE } from "../../components/bi/dataSource";
import EmptyState from "../../components/ui/EmptyState";
import ButtonLink from "../../components/ui/ButtonLink";

export default function InsightPage() {
  return (
    <AppShell
      title="Business Insight"
      description="Every number tells a story."
      compact
    >
      <DataSourceBadge source={OPENING_DATA_SOURCE} />
      <EmptyState
        icon={Lightbulb}
        title="Insight กำลังจะมา"
        hint="Command Center ของทั้งแพลตฟอร์ม — อ่านและสรุปจาก Shared Core ไม่ใช่ที่กรอกข้อมูล"
        actionLabel="ไปเปิดร้าน"
        actionHref="/opening"
      />
      <ButtonLink href="/modes" variant="secondary" fullWidth>
        เปลี่ยน Workspace
      </ButtonLink>
    </AppShell>
  );
}
