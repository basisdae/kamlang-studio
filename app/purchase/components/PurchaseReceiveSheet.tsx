"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import { getIngredientById } from "../../ingredients/IngredientRepository";
import {
  applyPurchaseReceive,
  getDefaultReceiveQuantity,
  getReceiveStockUnit,
} from "../../lib/inventoryReceiveService";
import { formatProductionQuantity } from "../../production/utils";
import type { PurchaseList, PurchaseListLine } from "../types";
import type { SavedPurchaseLineState } from "../types";
import { purchaseLineKey } from "../utils";

type ReceiveDraft = {
  lineKey: string;
  line: PurchaseListLine;
  quantity: string;
};

type Props = {
  isOpen: boolean;
  purchaseList: PurchaseList;
  lineStates: Record<string, SavedPurchaseLineState>;
  onClose: () => void;
  onConfirm: () => void;
};

const fieldClassName = "kl-input mt-2";

function parseQuantity(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function PurchaseReceiveSheet({
  isOpen,
  purchaseList,
  lineStates,
  onClose,
  onConfirm,
}: Props) {
  const [drafts, setDrafts] = useState<ReceiveDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showRepeatConfirm, setShowRepeatConfirm] = useState(false);
  const [allowRepeat, setAllowRepeat] = useState(false);

  const checkedLines = useMemo(() => {
    return purchaseList.lines.filter((line) => {
      const key = purchaseLineKey(line.ingredientId, line.unit);
      return lineStates[key]?.isBought;
    });
  }, [purchaseList.lines, lineStates]);

  const pendingLines = useMemo(
    () =>
      checkedLines.filter((line) => {
        const key = purchaseLineKey(line.ingredientId, line.unit);
        return !lineStates[key]?.isReceived;
      }),
    [checkedLines, lineStates]
  );

  const alreadyReceivedLines = useMemo(
    () =>
      checkedLines.filter((line) => {
        const key = purchaseLineKey(line.ingredientId, line.unit);
        return lineStates[key]?.isReceived;
      }),
    [checkedLines, lineStates]
  );

  const targetLines = useMemo(
    () => (allowRepeat ? checkedLines : pendingLines),
    [allowRepeat, checkedLines, pendingLines]
  );

  useEffect(() => {
    if (!isOpen) {
      setShowRepeatConfirm(false);
      setAllowRepeat(false);
      setError(null);
      setDrafts([]);
      return;
    }

    if (
      !allowRepeat &&
      alreadyReceivedLines.length > 0 &&
      pendingLines.length === 0
    ) {
      setShowRepeatConfirm(true);
      setDrafts([]);
      return;
    }

    setShowRepeatConfirm(false);
    setDrafts(
      targetLines.map((line) => ({
        lineKey: purchaseLineKey(line.ingredientId, line.unit),
        line,
        quantity: String(getDefaultReceiveQuantity(line)),
      }))
    );
    setError(null);
  }, [isOpen, allowRepeat, targetLines, alreadyReceivedLines.length, pendingLines.length]);

  function updateDraftQuantity(lineKey: string, quantity: string) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.lineKey === lineKey ? { ...draft, quantity } : draft
      )
    );
  }

  function handleConfirm() {
    const inputs = [];

    for (const draft of drafts) {
      const quantity = parseQuantity(draft.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        const ingredient = getIngredientById(draft.line.ingredientId);
        setError(`กรุณาใส่จำนวนรับเข้าที่ถูกต้องสำหรับ ${ingredient?.name ?? "รายการ"}`);
        return;
      }

      inputs.push({
        lineKey: draft.lineKey,
        ingredientId: draft.line.ingredientId,
        receivedQuantity: quantity,
      });
    }

    if (inputs.length === 0) {
      setError("ไม่มีรายการที่จะรับเข้า");
      return;
    }

    applyPurchaseReceive(purchaseList.planDate, purchaseList.planId, inputs);
    onConfirm();
    onClose();
  }

  if (!isOpen) return null;

  if (showRepeatConfirm) {
    return (
      <div
        className="kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4"
        onClick={onClose}
      >
        <div
          className="kl-sheet"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="kl-type-card-title">รายการรับเข้าแล้ว</div>
          <p className="kl-type-helper mt-2">
            รายการที่เอาเข้าครัวแล้ว {alreadyReceivedLines.length}{" "}
            รายการ ต้องการรับซ้ำหรือไม่?
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" fullWidth onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              fullWidth
              onClick={() => {
                setAllowRepeat(true);
                setShowRepeatConfirm(false);
              }}
            >
              รับซ้ำ
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4"
      onClick={onClose}
    >
      <div
        className="kl-sheet kl-sheet--scroll"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="kl-type-card-title">เอาเข้าครัว</div>
        <p className="kl-type-helper mt-1">
          ปรับจำนวนก่อนยืนยัน ({targetLines.length} รายการ)
        </p>

        {alreadyReceivedLines.length > 0 && !allowRepeat ? (
          <p className="kl-type-caption mt-2 text-kl-warning-text">
            ข้าม {alreadyReceivedLines.length} รายการที่รับเข้าแล้ว
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {drafts.map((draft) => {
            const ingredient = getIngredientById(draft.line.ingredientId);
            const stockUnit = getReceiveStockUnit(draft.line.ingredientId);

            return (
              <div key={draft.lineKey} className="kl-sheet-row space-y-0">
                <div className="kl-type-card-title">
                  {ingredient?.name ?? "ไม่พบวัตถุดิบ"}
                </div>
                <div className="kl-type-caption mt-1">
                  ซื้อ {formatProductionQuantity(draft.line.quantityNeeded)}{" "}
                  {draft.line.unit}
                </div>
                <label className="kl-type-label mt-3 block">
                  รับเข้า ({stockUnit ?? draft.line.unit})
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={draft.quantity}
                  onChange={(event) =>
                    updateDraftQuantity(draft.lineKey, event.target.value)
                  }
                  className={fieldClassName}
                />
              </div>
            );
          })}
        </div>

        {error ? (
          <div className="kl-type-caption mt-3 text-kl-danger-text">{error}</div>
        ) : null}

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>
            ยกเลิก
          </Button>
          <Button fullWidth onClick={handleConfirm}>
            ยืนยันเอาเข้าครัว
          </Button>
        </div>
      </div>
    </div>
  );
}
