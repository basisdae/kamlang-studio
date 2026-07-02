import Card from "../../../components/ui/Card";
import type { ImportUiType } from "../types";
import { IMPORT_TYPE_OPTIONS } from "../types";

type Props = {
  value: ImportUiType;
  onChange: (value: ImportUiType) => void;
};

export default function ImportTypePicker({ value, onChange }: Props) {
  return (
    <Card className="space-y-3">
      <div className="kl-type-card-title">ประเภทข้อมูล</div>

      <div className="grid grid-cols-2 gap-2">
        {IMPORT_TYPE_OPTIONS.map((option) => {
          const isActive = option.id === value;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`kl-option-tile kl-pressable ${
                isActive ? "kl-option-tile--active" : ""
              }`}
            >
              <div className="kl-type-card-title">{option.label}</div>
              <div
                className={`kl-type-caption mt-1 kl-option-tile-hint ${
                  isActive ? "" : ""
                }`}
              >
                {option.description}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
