"use client";

import { useEffect, useState } from "react";
import Button from "../../../../components/ui/Button";
import StepperButton from "../../../../components/ui/StepperButton";
import { formatIngredientPrice } from "../../../ingredients/utils";
import { getIngredientById } from "../../../ingredients/IngredientRepository";
import type { DisplayRecipeLine, LineOverride } from "../scaling";
import { computeLineCost } from "../scaling";
import { formatRecipeUnit, getQuantityStep } from "../utils";

const UNIT_OPTIONS = [
  "g",
  "kg",
  "ml",
  "liter",
  "piece",
  "pack",
  "bunch",
] as const;

const fieldClassName = "kl-input";

type Props = {
  line: DisplayRecipeLine | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (lineIndex: number, override: LineOverride) => void;
};

function parseQuantity(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function roundQuantity(value: number) {
  return Math.round(value * 10) / 10;
}

export default function IngredientLineEditor({
  line,
  isOpen,
  onClose,
  onUpdate,
}: Props) {
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!line || !isOpen) return;

    setQuantity(String(line.quantity));
    setUnit(line.unit);
    setNote(line.note ?? "");
  }, [line?.lineIndex, isOpen]);

  if (!isOpen || !line) return null;

  const lineIndex = line.lineIndex;
  const numericQuantity = parseQuantity(quantity);
  const ingredient = getIngredientById(line.ingredientId);
  const lineCost = numericQuantity
    ? computeLineCost(line.ingredientId, numericQuantity, unit)
    : 0;
  const step = getQuantityStep(unit);

  function applyUpdate(
    nextQuantity: number,
    nextUnit: string,
    nextNote: string
  ) {
    if (nextQuantity <= 0) return;

    onUpdate(lineIndex, {
      quantity: roundQuantity(nextQuantity),
      unit: nextUnit,
      note: nextNote.trim() || undefined,
    });
  }

  function handleQuantityChange(value: string) {
    setQuantity(value);
    const parsed = parseQuantity(value);
    if (parsed > 0) {
      applyUpdate(parsed, unit, note);
    }
  }

  function handleUnitChange(nextUnit: string) {
    setUnit(nextUnit);
    const parsed = parseQuantity(quantity);
    if (parsed > 0) {
      applyUpdate(parsed, nextUnit, note);
    }
  }

  function handleNoteChange(value: string) {
    setNote(value);
    const parsed = parseQuantity(quantity);
    if (parsed > 0) {
      applyUpdate(parsed, unit, value);
    }
  }

  function adjustQuantity(delta: number) {
    const parsed = parseQuantity(quantity);
    const base = parsed > 0 ? parsed : step;
    const next = Math.max(step, roundQuantity(base + delta));
    setQuantity(String(next));
    applyUpdate(next, unit, note);
  }

  return (
    <div
      className="kl-sheet-overlay fixed inset-0 z-50 flex items-end kl-sheet-scrim px-4"
      onClick={onClose}
    >
      <div
        className="kl-sheet kl-sheet--modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-kl-border" />

        <div className="kl-type-card-title">{line.name}</div>
        {ingredient ? (
          <div className="kl-type-caption mt-1">
            {formatIngredientPrice(ingredient)}
          </div>
        ) : null}

        <p className="kl-type-helper mt-2">ปรับจำนวนแล้วต้นทุนจะเปลี่ยนทันที</p>

        <div className="mt-5 flex items-center justify-center gap-4">
          <StepperButton
            kind="decrement"
            onClick={() => adjustQuantity(-step)}
            aria-label="ลดจำนวน"
          />

          <div className="min-w-[5rem] text-center">
            <div className="kl-type-metric-lg">
              {numericQuantity > 0 ? quantity : "—"}
            </div>
            <div className="kl-type-label mt-0.5">
              {formatRecipeUnit(unit)}
            </div>
          </div>

          <StepperButton
            kind="increment"
            onClick={() => adjustQuantity(step)}
            aria-label="เพิ่มจำนวน"
          />
        </div>

        <div className="mt-5 grid grid-cols-[1fr_110px] gap-3">
          <input
            value={quantity}
            onChange={(event) => handleQuantityChange(event.target.value)}
            className={fieldClassName}
            inputMode="decimal"
            aria-label="จำนวน"
          />

          <select
            value={unit}
            onChange={(event) => handleUnitChange(event.target.value)}
            className={fieldClassName}
            aria-label="หน่วย"
          >
            {UNIT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {formatRecipeUnit(option)}
              </option>
            ))}
          </select>
        </div>

        <input
          value={note}
          onChange={(event) => handleNoteChange(event.target.value)}
          className={`mt-3 w-full ${fieldClassName}`}
          placeholder="หมายเหตุ (ไม่บังคับ)"
          aria-label="หมายเหตุ"
        />

        <div className="mt-4 flex items-center justify-between pt-3">
          <span className="kl-type-caption text-kl-muted">ต้นทุนในสูตร</span>
          <strong className="kl-type-metric">฿{lineCost}</strong>
        </div>

        <Button type="button" variant="secondary" fullWidth className="mt-5" onClick={onClose}>
          เสร็จสิ้น
        </Button>
      </div>
    </div>
  );
}
