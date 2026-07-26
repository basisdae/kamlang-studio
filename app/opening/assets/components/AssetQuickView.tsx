"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import SheetActions from "../../../../components/ui/SheetActions";
import { KL_FIELD_CLASS } from "../../../../components/ui/designLock";
import {
  ASSET_STATUS_FLOW,
  ASSET_STATUS_LABELS,
  type AssetItem,
  type AssetStatus,
} from "../../../../data/seed/tangtao";
import { formatBaht } from "../../sampleData";
import { useAssets } from "../AssetsProvider";

type Props = {
  item: AssetItem | null;
  open: boolean;
  onClose: () => void;
};

function priceToInput(value: number | null): string {
  return value == null ? "" : String(value);
}

function parsePrice(raw: string): { ok: true; value: number | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };
  const normalized = trimmed.replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, error: "ราคาต้องเป็นตัวเลขเท่านั้น" };
  }
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) {
    return { ok: false, error: "ราคาต้องเป็นตัวเลข ≥ 0" };
  }
  return { ok: true, value: n };
}

/**
 * Quick View — edit price + status on the list without leaving scroll position.
 * Desktop: centered modal · Mobile: bottom sheet.
 */
export default function AssetQuickView({ item, open, onClose }: Props) {
  const titleId = useId();
  const { updateAsset, saving } = useAssets();
  const [priceText, setPriceText] = useState("");
  const [status, setStatus] = useState<AssetStatus>("planned");
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (!open || !item) return;
    setPriceText(priceToInput(item.estimatedPrice));
    setStatus(item.status);
    setError(null);
    setConfirmDiscard(false);
  }, [open, item]);

  const dirty =
    item != null &&
    (status !== item.status ||
      priceToInput(item.estimatedPrice) !== priceText.trim());

  function requestClose() {
    if (saving) return;
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    setConfirmDiscard(false);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        requestClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close uses latest dirty/saving
  }, [open, dirty, saving, confirmDiscard]);

  async function handleSave() {
    if (!item || saving) return;
    setError(null);
    setConfirmDiscard(false);

    const parsed = parsePrice(priceText);
    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }
    if (!status) {
      setError("กรุณาเลือกสถานะ");
      return;
    }

    const updated = await updateAsset(item.id, {
      estimatedPrice: parsed.value,
      status,
    });

    if (!updated) {
      setError("บันทึกไม่สำเร็จ — ตรวจเน็ตแล้วลองใหม่");
      return;
    }
    onClose();
  }

  if (!open || !item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="kl-sheet-scrim fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 pt-10 md:items-center md:pb-10"
      onClick={requestClose}
    >
      <div
        className="mx-auto w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
      <Card className="space-y-3 !p-3.5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id={titleId} className="kl-type-card-title truncate">
              {item.name}
            </p>
            <p className="kl-type-helper mt-0.5 truncate">
              {item.category} · {item.quantity} {item.unit}
            </p>
          </div>
          <Button
            type="button"
            variant="text"
            size="sm"
            disabled={saving}
            onClick={requestClose}
            aria-label="ปิด"
          >
            ปิด
          </Button>
        </div>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">ราคา (บาท / หน่วย)</span>
          <input
            className={KL_FIELD_CLASS}
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            value={priceText}
            disabled={saving}
            placeholder="เช่น 1500"
            onChange={(e) => {
              setPriceText(e.target.value);
              setError(null);
              setConfirmDiscard(false);
            }}
          />
          {item.estimatedPrice != null ? (
            <p className="kl-type-caption mt-1 text-kl-muted">
              ค่าปัจจุบัน: {formatBaht(item.estimatedPrice)}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="kl-type-caption text-kl-muted">สถานะ</span>
          <select
            className={KL_FIELD_CLASS}
            value={status}
            disabled={saving}
            onChange={(e) => {
              setStatus(e.target.value as AssetStatus);
              setError(null);
              setConfirmDiscard(false);
            }}
          >
            {ASSET_STATUS_FLOW.map((s) => (
              <option key={s} value={s}>
                {ASSET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <p className="kl-type-caption text-kl-danger-text" role="alert">
            {error}
          </p>
        ) : null}

        {confirmDiscard ? (
          <div className="space-y-2 rounded-[var(--kl-radius-inner)] bg-kl-surface p-3">
            <p className="kl-type-helper">
              มีการแก้ไขที่ยังไม่บันทึก — ต้องการปิดโดยไม่บันทึกหรือไม่?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => setConfirmDiscard(false)}
              >
                กลับไปแก้
              </Button>
              <Button
                type="button"
                fullWidth
                onClick={() => {
                  setConfirmDiscard(false);
                  onClose();
                }}
              >
                ปิดโดยไม่บันทึก
              </Button>
            </div>
          </div>
        ) : (
          <SheetActions
            cancelLabel="ยกเลิก"
            confirmLabel={saving ? "กำลังบันทึก…" : "บันทึก"}
            onCancel={requestClose}
            onConfirm={() => void handleSave()}
            isCancelDisabled={saving}
            isConfirmDisabled={saving}
          />
        )}

        <Link
          href={`/opening/assets/${item.id}/edit`}
          className="block text-center kl-type-caption underline text-[var(--bi-text-primary)]"
          onClick={(e) => {
            if (dirty) {
              e.preventDefault();
              setConfirmDiscard(true);
            }
          }}
        >
          แก้ไขแบบเต็ม →
        </Link>
      </Card>
      </div>
    </div>
  );
}
