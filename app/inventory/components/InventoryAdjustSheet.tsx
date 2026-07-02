"use client";

import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button";
import { getIngredientById } from "../../ingredients/IngredientRepository";
import { getEffectiveInventoryByIngredientId } from "../inventoryAccess";
import Badge from "../../../components/ui/Badge";
import VersionHistoryPanel from "../../../components/versionHistory/VersionHistoryPanel";
import {
  getSavedInventoryAdjustment,
  upsertInventoryAdjustment,
} from "../../repositories/SavedInventoryRepository";
import { addActivity } from "../../repositories/ActivityLogRepository";
import type { InventoryItem } from "../types";
import {
  getInventoryStatus,
  getInventoryStatusLabel,
} from "../utils";
import type { InventoryStatus } from "../types";

type Props = {
  item: InventoryItem;
  note?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

const fieldClassName = "kl-input mt-2";

function getStatusTone(status: InventoryStatus) {
  if (status === "low") return "draft" as const;
  if (status === "out") return "critical" as const;
  return "ready" as const;
}

function parseQuantity(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function InventoryAdjustSheet({
  item,
  note: initialNote = "",
  isOpen,
  onClose,
  onSaved,
}: Props) {
  const ingredient = getIngredientById(item.ingredientId);
  const name = ingredient?.name ?? "ไม่พบวัตถุดิบ";

  const [stockQuantity, setStockQuantity] = useState(
    String(item.stockQuantity)
  );
  const [minQuantity, setMinQuantity] = useState(String(item.minQuantity));
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setStockQuantity(String(item.stockQuantity));
    setMinQuantity(String(item.minQuantity));
    setNote(initialNote);
    setError(null);
  }, [isOpen, item, initialNote]);

  const previewStock = parseQuantity(stockQuantity);
  const previewMin = parseQuantity(minQuantity);
  const previewStatus =
    Number.isFinite(previewStock) && Number.isFinite(previewMin)
      ? getInventoryStatus({
          ...item,
          stockQuantity: previewStock,
          minQuantity: previewMin,
        })
      : getInventoryStatus(item);

  function handleSave() {
    const nextStock = parseQuantity(stockQuantity);
    const nextMin = parseQuantity(minQuantity);

    if (!Number.isFinite(nextStock) || nextStock < 0) {
      setError("กรุณาใส่จำนวนคงเหลือที่ถูกต้อง");
      return;
    }

    if (!Number.isFinite(nextMin) || nextMin < 0) {
      setError("กรุณาใส่จำนวนขั้นต่ำที่ถูกต้อง");
      return;
    }

    upsertInventoryAdjustment({
      ingredientId: item.ingredientId,
      stockQuantity: nextStock,
      minQuantity: nextMin,
      note: note.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });

    addActivity({
      type: "inventory_adjust",
      message: `ปรับของ "${name}" เหลือ ${nextStock} ${item.unit}`,
      entityType: "inventory",
      entityId: item.ingredientId,
    });

    onSaved();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4"
      onClick={onClose}
    >
      <div
        className="kl-sheet kl-sheet--scroll"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="kl-caption">ปรับจำนวนของ</div>
            <div className="mt-1 kl-type-card-title">{name}</div>
            <div className="kl-type-caption mt-1">หน่วย: {item.unit}</div>
          </div>

          <Badge tone={getStatusTone(previewStatus)}>
            {getInventoryStatusLabel(previewStatus)}
          </Badge>
        </div>

        <div className="mt-4">
          <VersionHistoryPanel
            entityType="inventory_adjustment"
            entityId={item.ingredientId}
            onRestored={() => {
              const effective = getEffectiveInventoryByIngredientId(
                item.ingredientId
              );
              const saved = getSavedInventoryAdjustment(item.ingredientId);

              if (effective) {
                setStockQuantity(String(effective.stockQuantity));
                setMinQuantity(String(effective.minQuantity));
              }

              setNote(saved?.note ?? "");
              onSaved();
            }}
          />
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="kl-type-label">
              คงเหลือ
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={stockQuantity}
              onChange={(event) => setStockQuantity(event.target.value)}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="kl-type-label">
              ขั้นต่ำ
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={minQuantity}
              onChange={(event) => setMinQuantity(event.target.value)}
              className={fieldClassName}
            />
          </div>

          <div>
            <label className="kl-type-label">
              หมายเหตุ (ถ้ามี)
            </label>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="เช่น นับของเช้า, ซื้อเพิ่มแล้ว"
              className={fieldClassName}
            />
          </div>

          {error ? (
            <div className="kl-type-caption text-kl-danger-text">{error}</div>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            ยกเลิก
          </Button>
          <Button fullWidth onClick={handleSave}>
            บันทึก
          </Button>
        </div>

        <div className="mt-3 text-center kl-caption">
          แตะบันทึกเพื่ออัปเดตของในครัว
        </div>
      </div>
    </div>
  );
}
