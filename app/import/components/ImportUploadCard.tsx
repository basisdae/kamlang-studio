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
  const sheets = option?.sheets.join(", ") ?? "";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    event.target.value = "";
  }

  return (
    <Card className="space-y-4">
      <div>
        <div className="font-bold text-kl-brown">อัปโหลดไฟล์ Excel</div>
        <p className="mt-1 text-sm text-kl-muted">
          ต้องมีชีต: {sheets}
        </p>
      </div>

      <label className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-kl-accent bg-kl-surface px-4 py-5 kl-pressable">
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
            <div className="text-center text-sm font-bold text-kl-brown">
              แตะเพื่อเลือกไฟล์
            </div>
            <div className="text-center text-xs text-kl-muted">.xlsx / .xls</div>
          </>
        )}
      </label>

      {fileName ? (
        <div className="kl-inset text-sm">
          <div className="kl-caption">ไฟล์ล่าสุด</div>
          <div className="mt-1 font-bold break-all text-kl-brown">{fileName}</div>
        </div>
      ) : null}
    </Card>
  );
}
