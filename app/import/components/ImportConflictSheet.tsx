import type {
  ConflictResolution,
  ImportConflict,
} from "../../lib/importWriteService";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

type NamedRecord = { id: string; name: string };

type Props = {
  conflicts: ImportConflict<NamedRecord>[];
  resolution: ConflictResolution;
  onResolutionChange: (value: ConflictResolution) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving: boolean;
};

const RESOLUTION_OPTIONS: Array<{
  value: ConflictResolution;
  label: string;
  description: string;
}> = [
  {
    value: "skip",
    label: "ข้าม",
    description: "ไม่บันทึกรายการที่ซ้ำ",
  },
  {
    value: "replace",
    label: "แทนที่",
    description: "ใช้ข้อมูลจากไฟล์แทนของเดิม",
  },
  {
    value: "add_new",
    label: "เพิ่มเป็นรายการใหม่",
    description: "เพิ่มเป็นรายการใหม่ (สร้างชื่อใหม่)",
  },
];

export default function ImportConflictSheet({
  conflicts,
  resolution,
  onResolutionChange,
  onConfirm,
  onCancel,
  isSaving,
}: Props) {
  return (
    <div className="kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4">
      <Card className="mx-auto max-h-[85vh] w-full max-w-md space-y-4 overflow-y-auto">
        <div>
          <div className="text-lg font-bold text-kl-brown">พบรายการซ้ำ</div>
          <p className="mt-1 text-sm text-kl-muted">
            เลือกวิธีจัดการ {conflicts.length} รายการที่ซ้ำกับข้อมูลเดิม
          </p>
        </div>

        <div className="space-y-2">
          {conflicts.map((conflict) => (
            <div
              key={`${conflict.matchBy}-${conflict.incoming.id}`}
              className="kl-inset text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-kl-brown">{conflict.incoming.name}</div>
                <Badge tone="warning">
                  ซ้ำ{conflict.matchBy === "id" ? "รหัส" : "ชื่อ"}
                </Badge>
              </div>
              <div className="mt-1 text-xs text-kl-muted">
                ไฟล์: {conflict.incoming.id}
              </div>
              <div className="mt-1 text-xs text-kl-muted">
                เดิม: {conflict.existing.name} ({conflict.existing.id})
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-kl-brown">จัดการรายการซ้ำ</div>
          {RESOLUTION_OPTIONS.map((option) => {
            const isActive = resolution === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onResolutionChange(option.value)}
                className={`w-full kl-option-tile kl-pressable ${
                  isActive ? "kl-option-tile--active" : ""
                }`}
              >
                <div className="kl-type-card-title">{option.label}</div>
                <div className="kl-type-caption mt-1 kl-option-tile-hint">
                  {option.description}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            ยกเลิก
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
