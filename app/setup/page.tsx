"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import {
  getSettings,
  isInitialSetupComplete,
  updateSettings,
} from "../repositories/SettingsRepository";
import type { KlCurrencyCode } from "../settings/types";
import { DEFAULT_GP_PERCENT } from "../settings/constants";
import SetupCompleteCard from "./components/SetupCompleteCard";
import SetupForm from "./components/SetupForm";

export default function SetupPage() {
  const pathname = usePathname();
  const [businessName, setBusinessName] = useState("");
  const [restaurantType, setRestaurantType] = useState("");
  const [currency, setCurrency] = useState<KlCurrencyCode>("THB");
  const [gpPercent, setGpPercent] = useState(String(DEFAULT_GP_PERCENT));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const isComplete = useMemo(
    () => isInitialSetupComplete() || justCompleted,
    [pathname, justCompleted]
  );

  useEffect(() => {
    const settings = getSettings();
    setBusinessName(settings.business.businessName);
    setRestaurantType(settings.business.restaurantType);
    setCurrency(settings.business.currency);
    setGpPercent(String(settings.pricing.defaultGpPercent));
  }, [pathname]);

  function handleSubmit() {
    setError(null);

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
        },
        setup: {
          completedAt: new Date().toISOString(),
        },
      });

      setJustCompleted(true);
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
      title="ตั้งค่าร้านครั้งแรก"
      description="เริ่มต้นใช้งาน"
      backHref="/"
    >
      {isComplete ? (
        <div className="space-y-4">
          <SetupCompleteCard businessName={businessName} />

          <Card className="text-sm leading-6 text-kl-muted">
            ต้องการแก้ไขภายหลัง? กรอกข้อมูลด้านล่างแล้วบันทึกอีกครั้ง
          </Card>

          <SetupForm
            businessName={businessName}
            restaurantType={restaurantType}
            currency={currency}
            gpPercent={gpPercent}
            error={error}
            isSaving={isSaving}
            onBusinessNameChange={setBusinessName}
            onRestaurantTypeChange={setRestaurantType}
            onCurrencyChange={setCurrency}
            onGpPercentChange={setGpPercent}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="rounded-2xl bg-kl-surface p-4 text-sm leading-6 text-kl-muted">
            ตั้งค่าพื้นฐานของร้านก่อนเริ่มสร้างสูตร เมนูขาย และแผนผลิต
          </Card>

          <SetupForm
            businessName={businessName}
            restaurantType={restaurantType}
            currency={currency}
            gpPercent={gpPercent}
            error={error}
            isSaving={isSaving}
            onBusinessNameChange={setBusinessName}
            onRestaurantTypeChange={setRestaurantType}
            onCurrencyChange={setCurrency}
            onGpPercentChange={setGpPercent}
            onSubmit={handleSubmit}
          />

          <p className="text-center text-xs text-kl-muted">
            ยังไม่พร้อม?{" "}
            <Link href="/" className="font-bold text-kl-brown">
              ข้ามไปหน้าแรก
            </Link>
          </p>
        </div>
      )}
    </AppShell>
  );
}
