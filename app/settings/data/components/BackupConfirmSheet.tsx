import type { KlBackupBundle } from "../types";
import Badge from "../../../../components/ui/Badge";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";

type Props = {
  bundle: KlBackupBundle;
  onConfirm: () => void;
  onCancel: () => void;
  isRestoring: boolean;
};

export default function BackupConfirmSheet({
  bundle,
  onConfirm,
  onCancel,
  isRestoring,
}: Props) {
  const keyCount = Object.keys(bundle.data).length;

  return (
    <div className="kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4">
      <Card className="mx-auto max-h-[85vh] w-full max-w-md space-y-4 overflow-y-auto">
        <div>
          <div className="kl-type-card-title">ยืนยันเอาข้อมูลกลับมา</div>
          <p className="kl-type-helper mt-2">
            ข้อมูลปัจจุบันจะถูกแทนที่ทั้งหมด
          </p>
        </div>

        <div className="space-y-2">
          <Badge tone="warning">คำเตือน</Badge>
          <p className="kl-type-body text-kl-warning-text">
            จะเขียนทับข้อมูลเดิมทั้งหมด ข้อมูลตัวอย่างไม่เปลี่ยน
          </p>
        </div>

        <div className="kl-card-emphasis">
          <div className="kl-type-label">ไฟล์สำรอง</div>
          <div className="kl-type-metric mt-1">{keyCount} ส่วน</div>
          <div className="kl-type-caption mt-1 text-kl-muted">
            ส่งออกเมื่อ{" "}
            {new Date(bundle.exportedAt).toLocaleString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isRestoring}
          >
            ยกเลิก
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isRestoring}>
            {isRestoring ? "กำลังเอากลับ..." : "ยืนยันเอากลับ"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
