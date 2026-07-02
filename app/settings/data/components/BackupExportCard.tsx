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
        <div className="kl-type-card-title">ดาวน์โหลดไฟล์สำรอง</div>
        <p className="kl-type-caption mt-1">
          บันทึกข้อมูลร้านทั้งหมดเป็นไฟล์
        </p>
      </div>

      <StatCell
        label="ข้อมูลที่บันทึกไว้"
        value={hasData ? `${keyCount} ส่วน` : "ยังไม่มีข้อมูลที่บันทึก"}
        className="text-left"
      />

      <Button type="button" fullWidth onClick={handleExport}>
        ดาวน์โหลดไฟล์สำรอง
      </Button>
    </Card>
  );
}
