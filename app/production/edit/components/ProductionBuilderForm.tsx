import { Plus } from "lucide-react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import { PRODUCTION_UI } from "../../copy";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../../components/layout/navConfig";
import type { Menu } from "../../../menu/types";
import type {
  ProductionBuilderValidationErrors,
  ProductionLineDraft,
} from "../../builder/types";

type Props = {
  date: string;
  lines: ProductionLineDraft[];
  menus: Menu[];
  validationErrors: ProductionBuilderValidationErrors;
  onDateChange: (value: string) => void;
  onAddLine: () => void;
  onRemoveLine: (key: string) => void;
  onUpdateLine: (
    key: string,
    patch: Partial<Pick<ProductionLineDraft, "menuId" | "quantity" | "note">>
  ) => void;
};

const fieldClassName = "kl-input mt-2";

export default function ProductionBuilderForm({
  date,
  lines,
  menus,
  validationErrors,
  onDateChange,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
}: Props) {
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <label className="kl-type-label">วันที่ทำ</label>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className={fieldClassName}
          />
          {validationErrors.date ? (
            <div className="kl-type-caption mt-1 text-kl-danger-text">
              {validationErrors.date}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="kl-type-card-title">เมนูที่จะทำวันนี้</div>
          <Button type="button" variant="secondary" size="sm" onClick={onAddLine}>
            <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
            เพิ่มเมนูขาย
          </Button>
        </div>

        {validationErrors.lines ? (
          <div className="kl-type-caption text-kl-danger-text">{validationErrors.lines}</div>
        ) : null}

        <div className="space-y-3">
          {lines.map((line, index) => (
            <div
              key={line.key}
              className="kl-nested-panel space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="kl-type-label">
                  รายการที่ {index + 1}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveLine(line.key)}
                  className="kl-tap-link kl-type-caption text-kl-muted kl-pressable"
                >
                  ลบ
                </button>
              </div>

              <div>
                <label className="kl-type-label">
                  เมนูขาย
                </label>
                <select
                  value={line.menuId}
                  onChange={(event) =>
                    onUpdateLine(line.key, { menuId: event.target.value })
                  }
                  className={fieldClassName}
                >
                  <option value="">เลือกเมนูขาย</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
                {validationErrors.lineMenuIds?.[line.key] ? (
                  <div className="kl-type-caption mt-1 text-kl-danger-text">
                    {validationErrors.lineMenuIds[line.key]}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="kl-type-label">
                  จำนวน
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={line.quantity}
                  onChange={(event) =>
                    onUpdateLine(line.key, { quantity: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="เช่น 25"
                />
                {validationErrors.lineQuantities?.[line.key] ? (
                  <div className="kl-type-caption mt-1 text-kl-danger-text">
                    {validationErrors.lineQuantities[line.key]}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="kl-type-label">
                  หมายเหตุ (ถ้ามี)
                </label>
                <input
                  value={line.note}
                  onChange={(event) =>
                    onUpdateLine(line.key, { note: event.target.value })
                  }
                  className={fieldClassName}
                  placeholder="เช่น ออเดอร์ Grab"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
