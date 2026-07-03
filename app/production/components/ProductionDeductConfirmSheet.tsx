"use client";

import BottomSheet from "../../../components/ui/BottomSheet";
import SheetActions from "../../../components/ui/SheetActions";
import { PRODUCTION_UI } from "../copy";
import { getIngredientById } from "../../ingredients/IngredientRepository";
import {
  applyProductionDeduction,
  getProductionDeductionNeeds,
  getProductionDeductionShortages,
} from "../../lib/inventoryDeductService";
import type { ProductionRollup } from "../../lib/productionRollupService";
import { formatProductionQuantity } from "../utils";
import {
  completeProductionPlanWithDeduction,
  getSavedPlanByDate,
} from "../../repositories/SavedProductionRepository";
import type { SavedProductionPlan } from "../builder/types";

type Props = {
  isOpen: boolean;
  rollup: ProductionRollup;
  onClose: () => void;
  onConfirmed: () => void;
};

function buildSavedPlanPayload(rollup: ProductionRollup): SavedProductionPlan {
  const now = new Date().toISOString();
  const existing = getSavedPlanByDate(rollup.plan.date);

  return {
    id: existing?.id ?? rollup.plan.id,
    date: rollup.plan.date,
    status: rollup.plan.status,
    lines: rollup.plan.lines.map((line) => ({ ...line })),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    deducted: existing?.deducted,
    deductedAt: existing?.deductedAt,
  };
}

export default function ProductionDeductConfirmSheet({
  isOpen,
  rollup,
  onClose,
  onConfirmed,
}: Props) {
  const needs = getProductionDeductionNeeds(rollup);
  const shortages = getProductionDeductionShortages(rollup);
  const canConfirm = shortages.length === 0;

  function handleConfirm() {
    if (!canConfirm) return;

    if (getSavedPlanByDate(rollup.plan.date)?.deducted) {
      onConfirmed();
      onClose();
      return;
    }

    applyProductionDeduction(rollup);
    completeProductionPlanWithDeduction(buildSavedPlanPayload(rollup));
    onConfirmed();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      innerClassName="space-y-4"
    >
        <div className="kl-type-card-title">ยืนยันตัดของในครัว</div>
        <p className="kl-type-helper">
          เปลี่ยนสถานะเป็น{PRODUCTION_UI.status.completed} และตัดของตามแผนวันนี้
        </p>

        {shortages.length > 0 ? (
          <div className="kl-alert-danger space-y-2">
            <div className="kl-type-card-title text-kl-danger-text">
              ของไม่พอ — ตัดไม่ได้
            </div>
            {shortages.map((item) => {
              const ingredient = getIngredientById(item.ingredientId);

              return (
                <div key={item.ingredientId} className="kl-type-caption text-kl-danger-text/90">
                  <div className="kl-type-body">
                    {ingredient?.name ?? item.name}
                  </div>
                  <div className="kl-type-label mt-1">
                    ต้องใช้ {formatProductionQuantity(item.required)} {item.unit}{" "}
                    • มี {formatProductionQuantity(item.available)} {item.unit}{" "}
                    (ขาด {formatProductionQuantity(item.shortfall)} {item.unit})
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {needs.map((item) => (
              <div
                key={item.ingredientId}
                className="kl-inset"
              >
                <div className="kl-type-card-title">{item.name}</div>
                <div className="kl-type-caption mt-1 text-kl-muted">
                  ตัด {formatProductionQuantity(item.required)} {item.unit}
                </div>
              </div>
            ))}
          </div>
        )}

        <SheetActions
          onCancel={onClose}
          onConfirm={handleConfirm}
          confirmLabel="ยืนยันตัดของ"
          isConfirmDisabled={!canConfirm}
        />
    </BottomSheet>
  );
}
