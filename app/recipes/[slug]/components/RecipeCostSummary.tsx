import { Check, Save } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Button from "../../../../components/ui/Button";import Card from "../../../../components/ui/Card";
import SectionTitle from "../../../../components/ui/SectionTitle";
import StatCell from "../../../../components/ui/StatCell";

type Props = {
  ingredientCost: number;
  suggestedPrice: number;
  gpPercent: number;
  onSave?: () => boolean;
  showSavedConfirmation?: boolean;
};

export default function RecipeCostSummary({
  ingredientCost,
  suggestedPrice,
  gpPercent,
  onSave,
  showSavedConfirmation = false,
}: Props) {
  return (
    <section className="space-y-3">
      <SectionTitle module="recipes">สรุปต้นทุน</SectionTitle>

      <Card className="space-y-5">
        <StatCell
          label="ราคาขายแนะนำ"
          value={`฿${suggestedPrice}`}
          size="lg"
          className="py-5"
        />

        <div className="grid grid-cols-2 gap-3">
          <StatCell label="ต้นทุนวัตถุดิบ" value={`฿${ingredientCost}`} />
          <StatCell label="กำไร %" value={`${gpPercent}%`} />
        </div>

        <p className="kl-type-helper text-center">
          ราคาขายอ้างอิงจากช่องทางหลัก หรือคำนวณจากเป้าต้นทุน
        </p>

        {onSave ? (
          <>
            {showSavedConfirmation ? (
              <div className="kl-type-caption flex items-center justify-center gap-1.5 text-kl-success-text">
                <Check
                  className={KL_ICON_SM_CLASS}
                  strokeWidth={KL_ICON_STROKE}
                />
                บันทึกแล้ว
              </div>
            ) : null}

            <Button fullWidth onClick={() => onSave()}>
              <Save className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
              บันทึกสูตร
            </Button>
          </>
        ) : null}
      </Card>
    </section>
  );
}
