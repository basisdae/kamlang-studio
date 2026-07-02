import { Check } from "lucide-react";
import {
  KL_ICON_SM_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import { useEffect, useRef, useState } from "react";
import Button from "../../../../components/ui/Button";
import { formatIngredientPrice } from "../../../ingredients/utils";
import type { IngredientPopupProps } from "../types";

const ADDED_CONFIRMATION_MS = 1000;

export default function IngredientPopup({
  isOpen,
  isEditingLine,
  onClose,
  search,
  onSearchChange,
  filteredIngredients,
  selectedIngredient,
  onSelectIngredient,
  quantity,
  onQuantityChange,
  unit,
  onUnitChange,
  onAdd,
  onCancelSelection,
}: IngredientPopupProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showAddedConfirmation, setShowAddedConfirmation] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowAddedConfirmation(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!showAddedConfirmation) return;

    const timer = setTimeout(
      () => setShowAddedConfirmation(false),
      ADDED_CONFIRMATION_MS
    );

    return () => clearTimeout(timer);
  }, [showAddedConfirmation]);

  useEffect(() => {
    if (!isOpen || selectedIngredient) return;

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen, selectedIngredient]);

  function handleAdd() {
    const success = onAdd();
    if (!success) return;

    if (isEditingLine) {
      onClose();
      return;
    }

    setShowAddedConfirmation(true);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end kl-sheet-scrim px-4 pb-4"
      onClick={onClose}
    >
      <div
        className="kl-sheet kl-sheet--modal"
        onClick={(e) => e.stopPropagation()}
      >
        {selectedIngredient ? (
          <>
            <div className="kl-type-card-title">{selectedIngredient.name}</div>
            <div className="mt-1 kl-type-caption">
              {formatIngredientPrice(selectedIngredient)}
            </div>

            <div className="mt-5 grid grid-cols-[1fr_110px] gap-3">
              <input
                value={quantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                className="kl-input"
                inputMode="decimal"
              />

              <select
                value={unit}
                onChange={(e) => onUnitChange(e.target.value)}
                className="kl-input"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="liter">liter</option>
                <option value="piece">piece</option>
                <option value="bunch">bunch</option>
              </select>
            </div>

            <div className="mt-5 flex gap-3">
              <Button variant="secondary" fullWidth onClick={onCancelSelection}>
                ยกเลิก
              </Button>

              <Button fullWidth onClick={handleAdd}>
                {isEditingLine ? "บันทึก" : "เพิ่ม"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="kl-type-card-title">วัตถุดิบ</div>

            {showAddedConfirmation && (
              <div className="kl-type-caption mt-2 flex items-center gap-1.5 text-kl-success-text">
                <Check className={KL_ICON_SM_CLASS} strokeWidth={KL_ICON_STROKE} />
                เพิ่มแล้ว
              </div>
            )}

            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="kl-input mt-3 w-full"
              placeholder="ค้นหาวัตถุดิบ..."
            />

            <div className="mt-3 max-h-[50vh] space-y-2 overflow-y-auto">
              {filteredIngredients.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectIngredient(item.id)}
                  className="kl-picker-row kl-pressable"
                >
                  <div className="kl-type-card-title">{item.name}</div>
                  <div className="mt-1 kl-type-caption">
                    {formatIngredientPrice(item)} • ใช้บ่อย
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
