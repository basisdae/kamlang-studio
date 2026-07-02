"use client";

import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
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
    <div
      className="kl-sheet-overlay fixed inset-0 flex items-end kl-sheet-scrim px-4"
      onClick={onClose}
    >
      <div
        className="mx-auto max-h-[85vh] w-full max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <Card className="max-h-[85vh] space-y-4 overflow-y-auto">
        <div className="kl-type-card-title">ยืนยันหักของ</div>
        <p className="kl-type-helper">
          เปลี่ยนสถานะเป็น{PRODUCTION_UI.status.completed} และหักของตามแผนผลิต
        </p>

        {shortages.length > 0 ? (
          <Card className="space-y-2 rounded-2xl border border-kl-danger bg-kl-danger p-4">
            <div className="kl-type-card-title text-kl-danger-text">
              ของไม่พอ — หักไม่ได้
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
          </Card>
        ) : (
          <div className="space-y-2">
            {needs.map((item) => (
              <div
                key={item.ingredientId}
                className="kl-inset"
              >
                <div className="kl-type-card-title">{item.name}</div>
                <div className="kl-type-caption mt-1 text-kl-muted">
                  หัก {formatProductionQuantity(item.required)} {item.unit}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            ยืนยันหักของ
          </Button>
        </div>
        </Card>
      </div>
    </div>
  );
}
