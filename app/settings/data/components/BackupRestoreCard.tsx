import { Download } from "lucide-react";
import {
  KL_ICON_LG_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Card from "../../../../components/ui/Card";
import FileUploadZoneSkeleton from "../../../../components/ui/skeletons/FileUploadZoneSkeleton";
type Props = {
  fileName: string | null;
  isProcessing: boolean;
  onFileSelect: (file: File) => void;
};

export default function BackupRestoreCard({
  fileName,
  isProcessing,
  onFileSelect,
}: Props) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    event.target.value = "";
  }

  return (
    <Card className="space-y-4">
      <div>
        <div className="kl-type-card-title">เอาข้อมูลกลับมา</div>
        <p className="kl-type-caption mt-1">
          เลือกไฟล์สำรองที่เคยดาวน์โหลด
        </p>
      </div>

      <label className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-kl-accent bg-kl-surface px-4 py-5 kl-pressable">
        <input
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleChange}
          disabled={isProcessing}
        />
        {isProcessing ? (
          <FileUploadZoneSkeleton />
        ) : (
          <>
            <Download
              className={`${KL_ICON_LG_CLASS} text-kl-muted`}
              strokeWidth={KL_ICON_STROKE}
            />
            <div className="kl-type-card-title text-center">
              แตะเพื่อเลือกไฟล์สำรอง
            </div>
            <div className="kl-type-label text-center text-kl-muted">ไฟล์สำรอง</div>
          </>
        )}
      </label>

      {fileName ? (
        <div className="kl-card-emphasis">
          <div className="kl-type-label">ไฟล์ที่เลือก</div>
          <div className="kl-type-body mt-1 break-all">{fileName}</div>
        </div>
      ) : null}    </Card>
  );
}
