"use client";

import { Beef, Minus, Plus } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
  KL_ICON_XL_CLASS,
} from "../../../components/layout/navConfig";
import IconButton from "../../../components/ui/IconButton";
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
        <div className="sheet-icon flex items-center justify-center">
          <Beef
            className={`${KL_ICON_XL_CLASS} text-kl-brown`}
            strokeWidth={KL_ICON_STROKE}
          />
        </div>

        <h2>{item.name}</h2>
        <p className="sheet-subtitle">ปรับจำนวนแล้วต้นทุนจะเปลี่ยนทันที</p>

        <div className="amount-control">
          <IconButton
            type="button"
            aria-label="ลดจำนวน"
            onClick={() => onUpdateAmount(item.name, -step)}
          >
            <Minus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          </IconButton>

          <div>
            <strong>{item.amount}</strong>
            <span>{item.unit}</span>
          </div>

          <IconButton
            type="button"
            aria-label="เพิ่มจำนวน"
            onClick={() => onUpdateAmount(item.name, step)}
          >
            <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          </IconButton>
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
