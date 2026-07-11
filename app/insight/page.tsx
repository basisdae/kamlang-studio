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
        hint="รอบนี้โฟกัสแผนเปิดร้านและงบประมาณก่อน ตัวเลขทุกตัวจะกดเจาะลึกได้ในอนาคต"
        actionLabel="ไปแผนเปิดร้าน"
        actionHref="/opening"
      />
      <ButtonLink href="/" variant="secondary" fullWidth>
        กลับภาพรวม
      </ButtonLink>
    </AppShell>
  );
}
