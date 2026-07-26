import { Check, Save } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Button from "../../../../components/ui/Button";
import ActionBar from "../../../../components/ui/ActionBar";
import type { BottomSummaryProps } from "../types";

export default function BottomSummary({
  totalCost,
  suggestedPrice,
  profit,
  profitPercent,
  onSave,
  onSaved,
}: BottomSummaryProps) {
  function handleSave() {
    const savedId = onSave();
    if (!savedId) return;
    onSaved?.(savedId);
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

      <p className="kl-type-caption flex items-center justify-center gap-1.5 text-kl-muted">
        <Check className={KL_ICON_SM_CLASS} strokeWidth={KL_ICON_STROKE} />
        บันทึกแล้วจะถามว่าจะทำอะไรต่อ
      </p>

      <Button fullWidth onClick={handleSave}>
        <Save className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        บันทึกสูตร
      </Button>
    </ActionBar>
  );
}
