import { FileSpreadsheet } from "lucide-react";
import {
  KL_ICON_LG_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import Card from "../../../components/ui/Card";
import FileUploadZoneSkeleton from "../../../components/ui/skeletons/FileUploadZoneSkeleton";
import type { ImportUiType } from "../types";
import { IMPORT_TYPE_OPTIONS } from "../types";

type Props = {
  importType: ImportUiType;
  fileName: string | null;
  isParsing: boolean;
  onFileSelect: (file: File) => void;
};

export default function ImportUploadCard({
  importType,
  fileName,
  isParsing,
  onFileSelect,
}: Props) {
  const option = IMPORT_TYPE_OPTIONS.find((item) => item.id === importType);
  const sheets = option?.sheetLabels.join(", ") ?? "";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    event.target.value = "";
  }

  return (
    <Card className="space-y-4">
      <div>
        <div className="kl-type-card-title">เลือกไฟล์ Excel</div>
        <p className="kl-type-helper mt-1">ต้องมีตาราง: {sheets}</p>
      </div>

      <label className="kl-upload-zone kl-pressable">
        <input
          type="file"
          accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          className="hidden"
          onChange={handleChange}
          disabled={isParsing}
        />
        {isParsing ? (
          <FileUploadZoneSkeleton />
        ) : (
          <>
            <FileSpreadsheet
              className={`${KL_ICON_LG_CLASS} text-kl-muted`}
              strokeWidth={KL_ICON_STROKE}
            />
            <div className="kl-type-card-title text-center">แตะเพื่อเลือกไฟล์</div>
            <div className="kl-type-label text-center text-kl-muted">.xlsx / .xls</div>
          </>
        )}
      </label>

      {fileName ? (
        <div className="kl-inset">
          <div className="kl-caption">ไฟล์ล่าสุด</div>
          <div className="kl-type-body mt-1 break-all">{fileName}</div>
        </div>
      ) : null}
    </Card>
  );
}
