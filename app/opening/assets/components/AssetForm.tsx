"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FormField from "../../../../components/ui/FormField";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import SectionHeader from "../../../../components/bi/SectionHeader";
import { KL_FIELD_CLASS } from "../../../../components/ui/designLock";
import {
  ASSET_CATEGORIES,
  ASSET_CHANNEL_LABELS,
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_FLOW,
  ASSET_STATUS_LABELS,
  ASSET_UNITS,
  SUPPLIERS,
  type AssetItem,
  type AssetPriority,
  type AssetPurchaseChannel,
  type AssetStatus,
} from "../../../../data/seed/tangtao";

export type AssetFormValues = Omit<
  AssetItem,
  "id" | "documentIds" | "imageUrl" | "purchaseHistory" | "repairHistory" | "decisionGroupId"
>;

export type AssetFormMode = "create" | "edit" | "buy" | "duplicate";

type AssetFormProps = {
  initial: AssetFormValues;
  submitLabel: string;
  mode?: AssetFormMode;
  modeHint?: string;
  sourceName?: string;
  submitDisabled?: boolean;
  onSubmit: (values: AssetFormValues) => void;
  onCancel: () => void;
};

const PRIORITY_OPTIONS: AssetPriority[] = ["must", "should", "nice"];

const CHANNEL_OPTIONS: AssetPurchaseChannel[] = [
  "store",
  "online",
  "marketplace",
  "other",
  "",
];

const inputClass = KL_FIELD_CLASS;

export function emptyAssetForm(): AssetFormValues {
  return {
    name: "",
    category: ASSET_CATEGORIES[0],
    brand: "",
    model: "",
    quantity: 1,
    unit: "ชิ้น",
    estimatedPrice: null,
    actualPrice: null,
    supplier: "",
    purchaseChannel: "",
    purchaseUrl: "",
    priority: "must",
    status: "planned",
    requiredForOpening: true,
    purchasedAt: null,
    size: "",
    color: "",
    material: "",
    power: "",
    specs: "",
    note: "",
    warranty: "",
    warrantyUntil: null,
    serialNumber: "",
  };
}

export function assetToFormValues(asset: AssetItem): AssetFormValues {
  return {
    name: asset.name,
    category: asset.category,
    brand: asset.brand,
    model: asset.model,
    quantity: asset.quantity,
    unit: asset.unit,
    estimatedPrice: asset.estimatedPrice,
    actualPrice: asset.actualPrice,
    supplier: asset.supplier,
    purchaseChannel: asset.purchaseChannel,
    purchaseUrl: asset.purchaseUrl,
    priority: asset.priority,
    status: asset.status,
    requiredForOpening: asset.requiredForOpening,
    purchasedAt: asset.purchasedAt,
    size: asset.size,
    color: asset.color,
    material: asset.material,
    power: asset.power,
    specs: asset.specs,
    note: asset.note,
    warranty: asset.warranty,
    warrantyUntil: asset.warrantyUntil,
    serialNumber: asset.serialNumber,
  };
}

/** Prefill for buy-more / duplicate — catalog locked fields kept */
export function copyCatalogFormValues(
  asset: AssetItem,
  mode: "buy" | "duplicate"
): AssetFormValues {
  return {
    ...assetToFormValues(asset),
    quantity: 1,
    estimatedPrice: mode === "buy" ? asset.estimatedPrice : asset.estimatedPrice,
    actualPrice: null,
    purchasedAt: null,
    status: mode === "buy" ? "ready_to_buy" : "planned",
    serialNumber: "",
    note:
      mode === "buy"
        ? `ซื้อเพิ่ม · รอบใหม่จาก “${asset.name}”`
        : `สำเนาจาก “${asset.name}”`,
  };
}

const STATUSES_NEED_PRICE: AssetStatus[] = [
  "ordered",
  "awaiting_delivery",
  "received",
  "in_use",
];

export default function AssetForm({
  initial,
  submitLabel,
  mode = "create",
  modeHint,
  sourceName,
  submitDisabled = false,
  onSubmit,
  onCancel,
}: AssetFormProps) {
  const [values, setValues] = useState<AssetFormValues>(initial);
  const [error, setError] = useState("");
  const [priceConfirmOpen, setPriceConfirmOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const lockCatalog = mode === "buy" || mode === "duplicate";
  const isBuy = mode === "buy";

  const supplierOptions = useMemo(
    () => Array.from(new Set(SUPPLIERS.map((s) => s.name))),
    []
  );

  useEffect(() => {
    if (!lockCatalog) {
      nameRef.current?.focus();
    }
  }, [lockCatalog]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      if (priceConfirmOpen) {
        setPriceConfirmOpen(false);
        setError("");
        return;
      }
      onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, priceConfirmOpen]);

  function setField<K extends keyof AssetFormValues>(
    key: K,
    value: AssetFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function parseMoney(raw: string): number | null {
    const cleaned = raw.replace(/,/g, "").trim();
    if (!cleaned) return null;
    const n = Number(cleaned);
    if (!Number.isFinite(n)) return null;
    return n;
  }

  function submitValues() {
    setError("");
    setPriceConfirmOpen(false);
    onSubmit({
      ...values,
      name: values.name.trim(),
      category: values.category.trim(),
      unit: values.unit.trim(),
    });
  }

  function validateBase(): string | null {
    if (!values.name.trim()) return "กรุณาใส่ชื่ออุปกรณ์";
    if (!values.category.trim()) return "กรุณาเลือกหมวด";
    if (!Number.isFinite(values.quantity) || values.quantity < 1) {
      return "จำนวนต้องอย่างน้อย 1 · ห้ามติดลบ";
    }
    if (!values.unit.trim()) return "กรุณาเลือกหน่วย";
    if (!values.status) return "กรุณาเลือกสถานะ";
    if (values.estimatedPrice != null && values.estimatedPrice < 0) {
      return "ราคาประเมินห้ามติดลบ";
    }
    if (values.actualPrice != null && values.actualPrice < 0) {
      return "ราคาจริงห้ามติดลบ";
    }
    if (isBuy && values.actualPrice == null && values.estimatedPrice == null) {
      return "กรุณาใส่ราคาสำหรับรอบซื้อนี้";
    }
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const baseError = validateBase();
    if (baseError) {
      setError(baseError);
      return;
    }

    const needsPrice = STATUSES_NEED_PRICE.includes(values.status);
    if (needsPrice && values.actualPrice == null) {
      setPriceConfirmOpen(true);
      setError(
        "สถานะนี้ควรมีราคาจริง — ยืนยันว่ายังไม่ทราบราคา หรือใส่ราคาจริงก่อนบันทึก"
      );
      return;
    }

    submitValues();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-28">
      {modeHint ? (
        <Card className="!p-3.5">
          <p className="kl-type-helper">{modeHint}</p>
        </Card>
      ) : null}

      {isBuy && sourceName ? (
        <Card className="space-y-2 !p-3.5 border border-[var(--bi-lemon)]">
          <p className="kl-type-label">อุปกรณ์เดิม</p>
          <p className="kl-type-card-title">{sourceName}</p>
          <p className="kl-type-helper">
            ประวัติซื้อเดิมจะถูกเก็บไว้ · ฟอร์มด้านล่างคือรอบการซื้อใหม่
          </p>
        </Card>
      ) : null}

      <section className="space-y-3">
        <SectionHeader title="1. ข้อมูลหลัก" />
        <Card className="space-y-4">
          <FormField label="ชื่ออุปกรณ์ *" htmlFor="asset-name">
            <input
              id="asset-name"
              ref={nameRef}
              className={inputClass}
              value={values.name}
              onChange={(e) => setField("name", e.target.value)}
              disabled={lockCatalog}
              required
              autoComplete="off"
            />
          </FormField>

          <FormField label="หมวด *">
            <select
              className={inputClass}
              value={values.category}
              onChange={(e) => setField("category", e.target.value)}
              disabled={lockCatalog}
              required
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="ยี่ห้อ">
              <input
                className={inputClass}
                value={values.brand}
                onChange={(e) => setField("brand", e.target.value)}
                disabled={lockCatalog}
              />
            </FormField>
            <FormField label="รุ่น">
              <input
                className={inputClass}
                value={values.model}
                onChange={(e) => setField("model", e.target.value)}
                disabled={lockCatalog}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={isBuy ? "จำนวนรอบนี้ *" : "จำนวน *"}>
              <input
                className={inputClass}
                type="number"
                min={1}
                value={values.quantity}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setField("quantity", Number.isFinite(n) ? n : 0);
                }}
              />
            </FormField>
            <FormField label="หน่วย *">
              <select
                className={inputClass}
                value={values.unit}
                onChange={(e) => setField("unit", e.target.value)}
                disabled={lockCatalog}
                required
              >
                {ASSET_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title={isBuy ? "2. การซื้อ (รอบใหม่)" : "2. การซื้อ"} />
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="ราคาประเมิน">
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="0"
                value={values.estimatedPrice ?? ""}
              onChange={(e) => {
                const n = parseMoney(e.target.value);
                setField("estimatedPrice", n != null && n < 0 ? 0 : n);
              }}
              />
            </FormField>
            <FormField label="ราคาจริง">
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="0"
                value={values.actualPrice ?? ""}
              onChange={(e) => {
                const n = parseMoney(e.target.value);
                setField("actualPrice", n != null && n < 0 ? 0 : n);
              }}
              />
            </FormField>
          </div>

          <FormField label="Supplier">
            <input
              className={inputClass}
              list="asset-suppliers"
              value={values.supplier}
              onChange={(e) => setField("supplier", e.target.value)}
              disabled={lockCatalog && !isBuy}
            />
            <datalist id="asset-suppliers">
              {supplierOptions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </FormField>

          <FormField label="ช่องทางซื้อ">
            <select
              className={inputClass}
              value={values.purchaseChannel}
              onChange={(e) =>
                setField(
                  "purchaseChannel",
                  e.target.value as AssetPurchaseChannel
                )
              }
              disabled={lockCatalog && !isBuy}
            >
              {CHANNEL_OPTIONS.map((c) => (
                <option key={c || "empty"} value={c}>
                  {ASSET_CHANNEL_LABELS[c]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="ลิงก์ซื้อ">
            <input
              className={inputClass}
              type="url"
              placeholder="https://"
              value={values.purchaseUrl}
              onChange={(e) => setField("purchaseUrl", e.target.value)}
              disabled={lockCatalog}
            />
          </FormField>

          <FormField label="วันที่ซื้อ">
            <input
              className={inputClass}
              type="date"
              value={values.purchasedAt ?? ""}
              onChange={(e) =>
                setField("purchasedAt", e.target.value || null)
              }
            />
          </FormField>
        </Card>
      </section>

      <section className="space-y-3">
        <SectionHeader title="3. การวางแผน" />
        <Card className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Priority">
              <select
                className={inputClass}
                value={values.priority}
                onChange={(e) =>
                  setField("priority", e.target.value as AssetPriority)
                }
                disabled={lockCatalog && !isBuy}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {ASSET_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="สถานะ *">
              <select
                className={inputClass}
                value={values.status}
                onChange={(e) =>
                  setField("status", e.target.value as AssetStatus)
                }
                required
              >
                {ASSET_STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>
                    {ASSET_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <label className="flex min-h-[2.75rem] items-center gap-3">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={values.requiredForOpening}
              onChange={(e) =>
                setField("requiredForOpening", e.target.checked)
              }
              disabled={lockCatalog && !isBuy}
            />
            <span className="kl-type-body">จำเป็นก่อนเปิดร้าน</span>
          </label>

          <FormField label={isBuy ? "หมายเหตุรอบซื้อ" : "หมายเหตุ"}>
            <textarea
              className={`${inputClass} min-h-[4.5rem] py-2`}
              value={values.note}
              onChange={(e) => setField("note", e.target.value)}
            />
          </FormField>
        </Card>
      </section>

      {!isBuy ? (
        <section className="space-y-3">
          <SectionHeader title="4. รายละเอียดสำหรับซื้อซ้ำ" />
          <Card className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="ขนาด">
                <input
                  className={inputClass}
                  value={values.size}
                  onChange={(e) => setField("size", e.target.value)}
                  disabled={lockCatalog}
                />
              </FormField>
              <FormField label="สี">
                <input
                  className={inputClass}
                  value={values.color}
                  onChange={(e) => setField("color", e.target.value)}
                  disabled={lockCatalog}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="วัสดุ">
                <input
                  className={inputClass}
                  value={values.material}
                  onChange={(e) => setField("material", e.target.value)}
                  disabled={lockCatalog}
                />
              </FormField>
              <FormField label="กำลังไฟ">
                <input
                  className={inputClass}
                  value={values.power}
                  onChange={(e) => setField("power", e.target.value)}
                  disabled={lockCatalog}
                />
              </FormField>
            </div>
            <FormField label="สเปกสำคัญ">
              <textarea
                className={`${inputClass} min-h-[4.5rem] py-2`}
                value={values.specs}
                onChange={(e) => setField("specs", e.target.value)}
                disabled={lockCatalog}
              />
            </FormField>
            <FormField label="Serial Number">
              <input
                className={inputClass}
                value={values.serialNumber}
                onChange={(e) => setField("serialNumber", e.target.value)}
              />
            </FormField>
            <FormField label="ระยะประกัน">
              <input
                className={inputClass}
                value={values.warranty}
                onChange={(e) => setField("warranty", e.target.value)}
              />
            </FormField>
            <FormField label="วันที่หมดประกัน">
              <input
                className={inputClass}
                type="date"
                value={values.warrantyUntil ?? ""}
                onChange={(e) =>
                  setField("warrantyUntil", e.target.value || null)
                }
              />
            </FormField>
          </Card>
        </section>
      ) : null}

      <section className="space-y-3">
        <SectionHeader title={isBuy ? "4. ไฟล์ในอนาคต" : "5. ไฟล์ในอนาคต"} />
        <Card className="!p-3.5">
          <p className="kl-type-helper">ยังไม่ Upload จริงในรอบนี้</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["รูปสินค้า", "ใบเสนอราคา", "ใบเสร็จ", "คู่มือ"].map((label) => (
              <span
                key={label}
                className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2 kl-type-caption"
              >
                {label} · Placeholder
              </span>
            ))}
          </div>
        </Card>
      </section>

      {error ? (
        <Card className="space-y-3 !p-3.5 border border-[var(--kl-danger, #c45c5c)]">
          <p className="kl-type-caption text-kl-danger-text">{error}</p>
          {priceConfirmOpen ? (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                className="min-h-[2.75rem]"
                onClick={() => {
                  setPriceConfirmOpen(false);
                  setError("");
                }}
              >
                กลับไปใส่ราคาจริง
              </Button>
              <Button
                type="button"
                fullWidth
                className="min-h-[2.75rem]"
                onClick={submitValues}
              >
                ยืนยันว่ายังไม่ทราบราคา · บันทึกต่อ
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--kl-border)] bg-kl-card px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-[var(--bi-app-width)] gap-2">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            className="min-h-[2.75rem]"
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
          <Button
            type="submit"
            fullWidth
            className="min-h-[2.75rem]"
            disabled={submitDisabled}
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
