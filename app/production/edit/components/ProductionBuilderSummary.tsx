import { Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import {
  KL_ICON_CLASS,
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Button from "../../../../components/ui/Button";
import StatCell from "../../../../components/ui/StatCell";
import type { ProductionRollup } from "../../../lib/productionRollupService";
import { formatProductionBaht } from "../../utils";

type Props = {
  preview: ProductionRollup | null;
  onSave: () => boolean;
};

const SAVED_CONFIRMATION_MS = 1000;

export default function ProductionBuilderSummary({ preview, onSave }: Props) {
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
              label="วัตถุดิบ"
              value={`${preview.ingredientTotals.length} รายการ`}
              size="sm"
            />
            <StatCell
              label="บรรจุภัณฑ์"
              value={`${preview.packagingTotals.length} รายการ`}
              size="sm"
            />
            <StatCell
              label="ต้นทุนรวม"
              value={`฿${formatProductionBaht(preview.totalCost)}`}
              size="sm"
            />
          </div>
        ) : (
          <p className="kl-type-helper text-center">
            เพิ่มเป้าผลิตเพื่อดูสรุป
          </p>
        )}

        {showSavedConfirmation ? (
          <div className="kl-type-caption mt-3 flex items-center justify-center gap-1.5 text-kl-success-text">
            <Check className={KL_ICON_SM_CLASS} strokeWidth={KL_ICON_STROKE} />
            บันทึกแล้ว
          </div>
        ) : null}

        <Button type="button" fullWidth className="mt-4" onClick={handleSave}>
          <Save className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          บันทึกแผนผลิต
        </Button>
      </div>
    </div>
  );
}
