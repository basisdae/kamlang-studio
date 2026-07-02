import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import type { KlCurrencyCode } from "../../settings/types";
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

const fieldClassName =
  "mt-2 w-full rounded-xl border border-kl-border bg-kl-surface px-4 py-3 text-sm text-kl-brown outline-none placeholder:text-kl-muted";

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
    <Card className="space-y-5">
      <div>
        <div className="font-semibold text-kl-brown">ข้อมูลร้าน</div>
        <p className="mt-1 text-sm text-kl-muted">
          ตั้งค่าพื้นฐานก่อนเริ่มใช้งาน
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-kl-muted">ชื่อร้าน</label>
          <input
            value={businessName}
            onChange={(event) => onBusinessNameChange(event.target.value)}
            className={fieldClassName}
            placeholder="เช่น ร้านกะเพราป้าแดง"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-kl-muted">
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
          <label className="text-sm font-semibold text-kl-muted">สกุลเงิน</label>
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

        <div>
          <label className="text-sm font-semibold text-kl-muted">
            ค่าเป้ากำไร (%)
          </label>
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
          <p className="mt-1 kl-caption">
            ใช้คำนวณราคาขายแนะนำจากต้นทุน
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-kl-danger bg-kl-danger px-4 py-3 text-sm text-kl-danger-text">
          {error}
        </div>
      ) : null}

      <Button type="button" fullWidth disabled={isSaving} onClick={onSubmit}>
        {isSaving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
      </Button>
    </Card>
  );
}
