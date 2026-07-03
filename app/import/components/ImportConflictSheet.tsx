import Badge from "../../../components/ui/Badge";
import BottomSheet from "../../../components/ui/BottomSheet";
import SheetActions from "../../../components/ui/SheetActions";
import type {
  ConflictResolution,
  ImportConflict,
} from "../../lib/importWriteService";

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
    label: "ใช้ของใหม่",
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
    <BottomSheet
      isOpen
      closeOnBackdrop={false}
      innerClassName="space-y-4"
    >
      <div>
        <div className="kl-type-card-title">พบรายการซ้ำ</div>
        <p className="kl-type-helper mt-1">
          เลือกวิธีจัดการ {conflicts.length} รายการที่ซ้ำกับข้อมูลเดิม
        </p>
      </div>

      <div className="space-y-2">
        {conflicts.map((conflict) => (
          <div
            key={`${conflict.matchBy}-${conflict.incoming.id}`}
            className="kl-inset"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="kl-type-card-title">{conflict.incoming.name}</div>
              <Badge tone="warning">
                ซ้ำ{conflict.matchBy === "id" ? "กับของเดิม" : "ชื่อ"}
              </Badge>
            </div>
            <div className="kl-type-label mt-1 text-kl-muted">
              ในไฟล์: {conflict.incoming.name}
            </div>
            <div className="kl-type-label mt-1 text-kl-muted">
              ในร้าน: {conflict.existing.name}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="kl-type-card-title">จัดการรายการซ้ำ</div>
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

      <SheetActions
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel={isSaving ? "กำลังบันทึก..." : "ยืนยันบันทึก"}
        isConfirmDisabled={isSaving}
        isCancelDisabled={isSaving}
      />
    </BottomSheet>
  );
}
