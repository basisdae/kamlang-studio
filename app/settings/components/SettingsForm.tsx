import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import SectionTitle from "../../../components/ui/SectionTitle";
import {
  CURRENCY_OPTIONS,
  RESTAURANT_TYPE_OPTIONS,
} from "../constants";
import type { KlCurrencyCode } from "../types";

type Props = {
  businessName: string;
  restaurantType: string;
  currency: KlCurrencyCode;
  gpPercent: string;
  labourPerPortion: string;
  gasPerPortion: string;
  electricityPerPortion: string;
  error: string | null;
  successMessage: string | null;
  isSaving: boolean;
  onBusinessNameChange: (value: string) => void;
  onRestaurantTypeChange: (value: string) => void;
  onCurrencyChange: (value: KlCurrencyCode) => void;
  onGpPercentChange: (value: string) => void;
  onLabourPerPortionChange: (value: string) => void;
  onGasPerPortionChange: (value: string) => void;
  onElectricityPerPortionChange: (value: string) => void;
  onSubmit: () => void;
};

const fieldClassName = "kl-input mt-2";

export default function SettingsForm({
  businessName,
  restaurantType,
  currency,
  gpPercent,
  labourPerPortion,
  gasPerPortion,
  electricityPerPortion,
  error,
  successMessage,
  isSaving,
  onBusinessNameChange,
  onRestaurantTypeChange,
  onCurrencyChange,
  onGpPercentChange,
  onLabourPerPortionChange,
  onGasPerPortionChange,
  onElectricityPerPortionChange,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <SectionTitle>ข้อมูลร้าน</SectionTitle>
        <Card className="space-y-4">
          <div>
            <label className="kl-type-label">
              ชื่อร้าน
            </label>
            <input
              value={businessName}
              onChange={(event) => onBusinessNameChange(event.target.value)}
              className={fieldClassName}
              placeholder="เช่น ร้านกะเพราป้าแดง"
            />
          </div>

          <div>
            <label className="kl-type-label">
              ประเภทร้าน
            </label>
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
          </div>

          <div>
            <label className="kl-type-label">
              สกุลเงิน
            </label>
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
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionTitle>ต้นทุนและราคา</SectionTitle>
        <Card className="space-y-4">
          <div>
            <label className="kl-type-label">
              เป้ากำไร (%)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              value={gpPercent}
              onChange={(event) => onGpPercentChange(event.target.value)}
              className={fieldClassName}
            />
            <p className="mt-1 kl-caption">
              ใช้คำนวณราคาขายแนะนำจากต้นทุน
            </p>
          </div>

          <div>
            <label className="kl-type-label">
              ค่าแรงต่อเสิร์ฟ (บาท)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={labourPerPortion}
              onChange={(event) => onLabourPerPortionChange(event.target.value)}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="kl-type-label">
              ค่าแก๊สต่อเสิร์ฟ (บาท)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={gasPerPortion}
              onChange={(event) => onGasPerPortionChange(event.target.value)}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="kl-type-label">
              ค่าไฟต่อเสิร์ฟ (บาท)
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={electricityPerPortion}
              onChange={(event) =>
                onElectricityPerPortionChange(event.target.value)
              }
              className={fieldClassName}
            />
          </div>
        </Card>
      </section>

      {error ? (
        <Card className="kl-type-caption text-kl-danger-text">
          {error}
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="kl-type-caption text-kl-success-text">
          {successMessage}
        </Card>
      ) : null}

      <Button type="button" fullWidth disabled={isSaving} onClick={onSubmit}>
        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </div>
  );
}
