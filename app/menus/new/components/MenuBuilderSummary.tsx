import { Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import {
  KL_ICON_CLASS,
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Button from "../../../../components/ui/Button";
import StatCell from "../../../../components/ui/StatCell";
import type { MenuCostBreakdown } from "../../../lib/menuCostService";
import { formatMenuBaht } from "../../utils";

type Props = {
  preview: MenuCostBreakdown | null;
  onSave: () => boolean;
  saveLabel?: string;
  saving?: boolean;
  costNotice?: string | null;
};

const SAVED_CONFIRMATION_MS = 1000;

export default function MenuBuilderSummary({
  preview,
  onSave,
  saveLabel = "บันทึกเมนูขาย",
  saving = false,
  costNotice = null,
}: Props) {
  const [showSavedConfirmation, setShowSavedConfirmation] = useState(false);

  useEffect(() => {
    if (!showSavedConfirmation) return;

    const timer = setTimeout(
      () => setShowSavedConfirmation(false),
      SAVED_CONFIRMATION_MS
    );

    return () => clearTimeout(timer);
  }, [showSavedConfirmation]);

  function handleSave() {
    if (saving) return;
    const success = onSave();
    if (!success) return;

    setShowSavedConfirmation(true);
  }

  return (
    <div className="fixed inset-x-0 kl-bottom-bar z-40 bg-kl-ivory/95 px-4 pb-4 pt-3 backdrop-blur">
      <div className="kl-action-bar-inner kl-card">
        {preview ? (
          <div className="grid grid-cols-3 gap-2">
            <StatCell
              label="ต้นทุนทำอาหาร"
              value={`฿${formatMenuBaht(preview.recipeCost)}`}
              size="sm"
            />
            <StatCell
              label="ของห่อกลับ"
              value={`฿${formatMenuBaht(preview.packagingCost)}`}
              size="sm"
            />
            <StatCell
              label="ต้นทุนรวม"
              value={`฿${formatMenuBaht(preview.totalCost)}`}
              size="sm"
            />
            <StatCell
              label="กำไร"
              value={
                preview.sellingPrice > 0 && Number.isFinite(preview.grossProfit)
                  ? `฿${formatMenuBaht(preview.grossProfit)}`
                  : "—"
              }
              size="sm"
            />
            <StatCell
              label="กำไร %"
              value={
                preview.sellingPrice > 0 &&
                Number.isFinite(preview.grossProfitPercent)
                  ? `${preview.grossProfitPercent}%`
                  : "รอคำนวณ"
              }
              size="sm"
            />
            <StatCell
              label="ราคาขาย"
              value={
                preview.sellingPrice > 0
                  ? `฿${formatMenuBaht(preview.sellingPrice)}`
                  : "ยังไม่ตั้ง"
              }
              size="sm"
            />
          </div>
        ) : (
          <p className="kl-type-helper text-center">
            {costNotice ?? "ยังไม่มีต้นทุน — บันทึกเมนูได้โดยไม่ต้องเลือกสูตร"}
          </p>
        )}

        {showSavedConfirmation ? (
          <div className="kl-type-caption mt-3 flex items-center justify-center gap-1.5 text-kl-success-text">
            <Check className={KL_ICON_SM_CLASS} strokeWidth={KL_ICON_STROKE} />
            บันทึกแล้ว
          </div>
        ) : null}

        <Button
          type="button"
          fullWidth
          className="mt-4"
          disabled={saving}
          onClick={handleSave}
        >
          <Save className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          {saving ? "กำลังบันทึก…" : saveLabel}
        </Button>
      </div>
    </div>
  );
}
