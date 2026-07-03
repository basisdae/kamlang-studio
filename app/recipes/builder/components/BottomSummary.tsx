import { Check, Save } from "lucide-react";
import { useEffect, useState } from "react";
import {
  KL_ICON_CLASS,
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Button from "../../../../components/ui/Button";
import ButtonLink from "../../../../components/ui/ButtonLink";
import ActionBar from "../../../../components/ui/ActionBar";
import type { BottomSummaryProps } from "../types";

const SAVED_CONFIRMATION_MS = 1000;

export default function BottomSummary({
  totalCost,
  suggestedPrice,
  profit,
  profitPercent,
  onSave,
}: BottomSummaryProps) {
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
    <ActionBar innerClassName="kl-card space-y-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="kl-type-label">ต้นทุน</div>
            <div className="kl-type-metric mt-1">฿{totalCost.toFixed(2)}</div>
          </div>

          <div>
            <div className="kl-type-label">ราคาแนะนำ</div>
            <div className="kl-type-metric mt-1">฿{suggestedPrice}</div>
          </div>

          <div>
            <div className="kl-type-label">กำไร</div>
            <div className="kl-type-metric mt-1">฿{profit.toFixed(2)}</div>
            <div className="kl-type-caption mt-0.5">{profitPercent}%</div>
          </div>
        </div>

        {showSavedConfirmation ? (
          <div className="space-y-3">
            <div className="kl-type-caption flex items-center justify-center gap-1.5 text-kl-success-text">
              <Check className={KL_ICON_SM_CLASS} strokeWidth={KL_ICON_STROKE} />
              บันทึกแล้ว
            </div>
            <ButtonLink href="/menus/new" variant="secondary" fullWidth>
              สร้างเมนูขายต่อ
            </ButtonLink>
          </div>
        ) : null}

        <Button fullWidth onClick={handleSave}>
          <Save className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          บันทึกสูตร
        </Button>
    </ActionBar>
  );
}
