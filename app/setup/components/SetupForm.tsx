import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import SectionTitle from "../../../components/ui/SectionTitle";import type { KlCurrencyCode } from "../../settings/types";
import {
  CURRENCY_OPTIONS,
  DEFAULT_GP_PERCENT,
  RESTAURANT_TYPE_OPTIONS,
} from "../../settings/constants";

type Props = {
  businessName: string;
  restaurantType: string;
  currency: KlCurrencyCode;
  gpPercent: string;
  error: string | null;
  isSaving: boolean;
  onBusinessNameChange: (value: string) => void;
  onRestaurantTypeChange: (value: string) => void;
  onCurrencyChange: (value: KlCurrencyCode) => void;
  onGpPercentChange: (value: string) => void;
  onSubmit: () => void;
};

const fieldClassName = "kl-input mt-2";

export default function SetupForm({
  businessName,
  restaurantType,
  currency,
  gpPercent,
  error,
  isSaving,
  onBusinessNameChange,
  onRestaurantTypeChange,
  onCurrencyChange,
  onGpPercentChange,
  onSubmit,
}: Props) {
  return (
    <Card className="space-y-4">
      <div>
        <SectionTitle>ข้อมูลร้าน</SectionTitle>
      </div>

      <div className="space-y-4">
        <FormField label="ชื่อร้าน">
          <input
            value={businessName}
            onChange={(event) => onBusinessNameChange(event.target.value)}
            className={fieldClassName}
            placeholder="เช่น ร้านกะเพราป้าแดง"
          />
        </FormField>

        <FormField label="ประเภทร้าน">
          <select
            value={restaurantType}
            onChange={(event) => onRestaurantTypeChange(event.target.value)}
            className={fieldClassName}
          >
            <option value="">เลือกประเภทร้าน</option>
            {RESTAURANT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="สกุลเงิน">
          <select
            value={currency}
            onChange={(event) =>
              onCurrencyChange(event.target.value as KlCurrencyCode)
            }
            className={fieldClassName}
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="เป้ากำไร (%)">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            value={gpPercent}
            onChange={(event) => onGpPercentChange(event.target.value)}
            className={fieldClassName}
            placeholder={String(DEFAULT_GP_PERCENT)}
          />
          <p className="mt-1 kl-caption">ใช้คิดราคาขายจากต้นทุน</p>
        </FormField>
      </div>
      {error ? <div className="kl-alert-danger">{error}</div> : null}

      <Button type="button" fullWidth disabled={isSaving} onClick={onSubmit}>
        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </Card>
  );
}
