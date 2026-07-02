"use client";

import { Ingredient } from "./types";
import { formatMoney, getStep } from "./utils";

type Props = {
  item: Ingredient;
  onClose: () => void;
  onUpdateAmount: (name: string, change: number) => void;
};

export default function IngredientSheet({
  item,
  onClose,
  onUpdateAmount,
}: Props) {
  const step = getStep(item.unit);

  return (
    <div className="sheet-overlay">
      <div className="bottom-sheet">
        <div className="sheet-handle" />
        <div className="sheet-icon">🥩</div>

        <h2>{item.name}</h2>
        <p className="sheet-subtitle">ปรับจำนวนแล้วต้นทุนจะเปลี่ยนทันที</p>

        <div className="amount-control">
          <div
            className="qty-touch"
            onClick={() => onUpdateAmount(item.name, -step)}
          >
            −
          </div>

          <div>
            <strong>{item.amount}</strong>
            <span>{item.unit}</span>
          </div>

          <div
            className="qty-touch"
            onClick={() => onUpdateAmount(item.name, step)}
          >
            +
          </div>
        </div>

        <div className="sheet-info">
          <span>ต้นทุนในสูตร</span>
          <strong>฿{formatMoney(item.amount * item.costPerUnit)}</strong>
        </div>

        <div className="done-button" onClick={onClose}>
          เสร็จสิ้น
        </div>
      </div>
    </div>
  );
}
