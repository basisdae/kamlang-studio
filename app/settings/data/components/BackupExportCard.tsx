import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import StatCell from "../../../../components/ui/StatCell";import { downloadUserBackup, getUserDataPresenceSummary } from "../../../lib/backupService";

type Props = {
  onExported: () => void;
};

export default function BackupExportCard({ onExported }: Props) {
  const { hasData, keyCount } = getUserDataPresenceSummary();

  function handleExport() {
    downloadUserBackup();
    onExported();
  }

  return (
    <Card className="space-y-4">
      <div>
        <div className="kl-type-card-title">บันทึกไฟล์เก็บไว้</div>
      </div>

      <StatCell
        label="ข้อมูลที่บันทึกไว้"
        value={hasData ? `${keyCount} อย่าง` : "ยังไม่มีข้อมูลที่บันทึก"}
        className="text-left"
      />

      <Button type="button" fullWidth onClick={handleExport}>
        บันทึกไฟล์
      </Button>
    </Card>
  );
}
