import type { KlBackupBundle } from "../types";
import Badge from "../../../../components/ui/Badge";
import BottomSheet from "../../../../components/ui/BottomSheet";
import SheetActions from "../../../../components/ui/SheetActions";

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
    <BottomSheet isOpen closeOnBackdrop={false} innerClassName="space-y-4">
      <div>
        <div className="kl-type-card-title">ยืนยันเอาข้อมูลกลับมา</div>
        <p className="kl-type-helper mt-2">
          ข้อมูลปัจจุบันจะถูกเขียนทับทั้งหมด
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

      <SheetActions
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel={isRestoring ? "กำลังเอากลับ..." : "ยืนยันเอากลับ"}
        isConfirmDisabled={isRestoring}
        isCancelDisabled={isRestoring}
      />
    </BottomSheet>
  );
}
