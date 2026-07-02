"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import {
  getSettings,
  updateSettings,
} from "../repositories/SettingsRepository";
import type { KlCurrencyCode } from "./types";
import SettingsForm from "./components/SettingsForm";

function parseNonNegative(value: string, label: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export default function SettingsPage() {
  const pathname = usePathname();
  const [businessName, setBusinessName] = useState("");
  const [restaurantType, setRestaurantType] = useState("");
  const [currency, setCurrency] = useState<KlCurrencyCode>("THB");
  const [gpPercent, setGpPercent] = useState("65");
  const [labourPerPortion, setLabourPerPortion] = useState("0");
  const [gasPerPortion, setGasPerPortion] = useState("0");
  const [electricityPerPortion, setElectricityPerPortion] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const settings = getSettings();
    setBusinessName(settings.business.businessName);
    setRestaurantType(settings.business.restaurantType);
    setCurrency(settings.business.currency);
    setGpPercent(String(settings.pricing.defaultGpPercent));
    setLabourPerPortion(String(settings.pricing.labourCostPerPortion));
    setGasPerPortion(String(settings.pricing.gasCostPerPortion));
    setElectricityPerPortion(String(settings.pricing.electricityCostPerPortion));
    setError(null);
    setSuccessMessage(null);
  }, [pathname]);

  function handleSubmit() {
    setError(null);
    setSuccessMessage(null);

    const trimmedName = businessName.trim();
    if (!trimmedName) {
      setError("กรุณาใส่ชื่อร้าน");
      return;
    }

    if (!restaurantType.trim()) {
      setError("กรุณาเลือกประเภทร้าน");
      return;
    }

    const parsedGp = Number(gpPercent);
    if (!Number.isFinite(parsedGp) || parsedGp < 0 || parsedGp > 100) {
      setError("เป้ากำไร % ต้องอยู่ระหว่าง 0–100");
      return;
    }

    const labour = parseNonNegative(labourPerPortion, "ค่าแรงต่อเสิร์ฟ");
    if (labour === null) {
      setError("ค่าแรงต่อเสิร์ฟต้องเป็นตัวเลขที่ไม่ติดลบ");
      return;
    }

    const gas = parseNonNegative(gasPerPortion, "ค่าแก๊สต่อเสิร์ฟ");
    if (gas === null) {
      setError("ค่าแก๊สต่อเสิร์ฟต้องเป็นตัวเลขที่ไม่ติดลบ");
      return;
    }

    const electricity = parseNonNegative(
      electricityPerPortion,
      "ค่าไฟต่อเสิร์ฟ"
    );
    if (electricity === null) {
      setError("ค่าไฟต่อเสิร์ฟต้องเป็นตัวเลขที่ไม่ติดลบ");
      return;
    }

    setIsSaving(true);

    try {
      updateSettings({
        business: {
          businessName: trimmedName,
          restaurantType: restaurantType.trim(),
          currency: currency.trim() || "THB",
        },
        pricing: {
          defaultGpPercent: parsedGp,
          labourCostPerPortion: labour,
          gasCostPerPortion: gas,
          electricityCostPerPortion: electricity,
        },
      });

      setSuccessMessage("บันทึกการตั้งค่าแล้ว");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "ไม่สามารถบันทึกการตั้งค่าได้";

      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell
      title="ตั้งค่า"
      description="ข้อมูลร้าน"
      backHref="/"
    >
      <SettingsForm
        businessName={businessName}
        restaurantType={restaurantType}
        currency={currency}
        gpPercent={gpPercent}
        labourPerPortion={labourPerPortion}
        gasPerPortion={gasPerPortion}
        electricityPerPortion={electricityPerPortion}
        error={error}
        successMessage={successMessage}
        isSaving={isSaving}
        onBusinessNameChange={setBusinessName}
        onRestaurantTypeChange={setRestaurantType}
        onCurrencyChange={setCurrency}
        onGpPercentChange={setGpPercent}
        onLabourPerPortionChange={setLabourPerPortion}
        onGasPerPortionChange={setGasPerPortion}
        onElectricityPerPortionChange={setElectricityPerPortion}
        onSubmit={handleSubmit}
      />

      <Card>
        <div className="kl-type-card-title">สำรองข้อมูล</div>
        <p className="kl-type-caption mt-1">
          ดาวน์โหลดหรือเอาข้อมูลกลับมา
        </p>
        <Link
          href="/settings/data"
          className="kl-type-caption mt-3 inline-flex items-center gap-1 text-kl-brown kl-pressable"
        >
          ไปสำรองข้อมูล
        </Link>
      </Card>
    </AppShell>
  );
}
