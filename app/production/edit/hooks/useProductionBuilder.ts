import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductionRollupForPlan } from "../../../lib/productionRollupService";
import { getAllMenus } from "../../../menu/MenuRepository";
import { getEffectivePlanByDate } from "../../planAccess";
import type {
  ProductionBuilderValidationErrors,
  ProductionLineDraft,
  SavedProductionPlan,
} from "../../builder/types";
import {
  getSavedPlanByDate,
  upsertSavedProductionPlan,
} from "../../../repositories/SavedProductionRepository";
import type { ProductionLine, ProductionPlan, ProductionPlanStatus } from "../../types";
import { nextPlanDate, todayPlanDate } from "../../utils";

function createEmptyLine(): ProductionLineDraft {
  return {
    key: crypto.randomUUID(),
    menuId: "",
    quantity: "",
    note: "",
  };
}

function mapPlanToLineDrafts(lines: ProductionLine[]): ProductionLineDraft[] {
  return lines.map((line) => ({
    key: crypto.randomUUID(),
    menuId: line.menuId,
    quantity: String(line.quantity),
    note: line.note ?? "",
  }));
}

function parseQuantity(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildPlanDraft(
  date: string,
  lines: ProductionLineDraft[],
  status: ProductionPlanStatus = "draft"
): ProductionPlan | null {
  const productionLines: ProductionLine[] = [];

  for (const line of lines) {
    const quantity = parseQuantity(line.quantity);
    if (!line.menuId || quantity <= 0) continue;

    productionLines.push({
      menuId: line.menuId,
      quantity,
      note: line.note.trim() || undefined,
    });
  }

  if (!date.trim() || productionLines.length === 0) {
    return null;
  }

  return {
    id: "preview",
    date: date.trim(),
    status,
    lines: productionLines,
  };
}

function validateForSave(
  date: string,
  lines: ProductionLineDraft[]
): ProductionBuilderValidationErrors {
  const errors: ProductionBuilderValidationErrors = {};

  if (!date.trim()) {
    errors.date = "กรุณาเลือกวันที่";
  }

  const lineMenuIds: Record<string, string> = {};
  const lineQuantities: Record<string, string> = {};
  const usedMenuIds = new Set<string>();
  let validLineCount = 0;

  for (const line of lines) {
    if (!line.menuId) {
      lineMenuIds[line.key] = "กรุณาเลือกเมนูขาย";
      continue;
    }

    if (usedMenuIds.has(line.menuId)) {
      lineMenuIds[line.key] = "เมนูขายนี้ถูกเลือกแล้ว";
      continue;
    }

    usedMenuIds.add(line.menuId);

    const quantity = parseQuantity(line.quantity);
    if (quantity <= 0) {
      lineQuantities[line.key] = "กรุณาใส่จำนวนที่มากกว่า 0";
      continue;
    }

    validLineCount += 1;
  }

  if (validLineCount === 0) {
    errors.lines = "กรุณาเพิ่มอย่างน้อย 1 เมนูขาย";
  }

  if (Object.keys(lineMenuIds).length > 0) {
    errors.lineMenuIds = lineMenuIds;
  }

  if (Object.keys(lineQuantities).length > 0) {
    errors.lineQuantities = lineQuantities;
  }

  return errors;
}

function loadPlanForDate(date: string) {
  const saved = getSavedPlanByDate(date);
  const plan = getEffectivePlanByDate(date);

  return {
    savedId: saved?.id ?? null,
    plan,
  };
}

export function useProductionBuilder(
  initialDate = todayPlanDate(),
  duplicateFromDate?: string | null
) {
  const router = useRouter();
  const menus = useMemo(
    () => getAllMenus().filter((menu) => menu.isActive),
    []
  );

  const [isLoaded, setIsLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState(initialDate);
  const [lines, setLines] = useState<ProductionLineDraft[]>([createEmptyLine()]);
  const [status, setStatus] = useState<ProductionPlanStatus>("draft");
  const [validationErrors, setValidationErrors] =
    useState<ProductionBuilderValidationErrors>({});

  useEffect(() => {
    if (duplicateFromDate) {
      const sourcePlan = getEffectivePlanByDate(duplicateFromDate);

      setEditingId(null);
      setDate(nextPlanDate(duplicateFromDate));
      setStatus("draft");

      if (sourcePlan) {
        setLines(mapPlanToLineDrafts(sourcePlan.lines));
      } else {
        setLines([createEmptyLine()]);
      }

      setIsLoaded(true);
      return;
    }

    const { savedId, plan } = loadPlanForDate(initialDate);

    setEditingId(savedId);
    setDate(initialDate);
    setStatus(plan?.status ?? "draft");

    if (plan) {
      setLines(mapPlanToLineDrafts(plan.lines));
    } else {
      setLines([createEmptyLine()]);
    }

    setIsLoaded(true);
  }, [initialDate, duplicateFromDate]);

  const preview = useMemo(() => {
    const draft = buildPlanDraft(date, lines, status);
    if (!draft) return null;

    try {
      return getProductionRollupForPlan(draft);
    } catch {
      return null;
    }
  }, [date, lines, status]);

  function handleDateChange(nextDate: string) {
    setDate(nextDate);

    const { savedId, plan } = loadPlanForDate(nextDate);
    setEditingId(savedId);

    if (plan) {
      setLines(mapPlanToLineDrafts(plan.lines));
      setStatus(plan.status);
      return;
    }

    setStatus("draft");
    setLines([createEmptyLine()]);
  }

  function addLine() {
    setLines((current) => [...current, createEmptyLine()]);
  }

  function removeLine(key: string) {
    setLines((current) => {
      if (current.length === 1) {
        return [createEmptyLine()];
      }

      return current.filter((line) => line.key !== key);
    });
  }

  function updateLine(
    key: string,
    patch: Partial<Pick<ProductionLineDraft, "menuId" | "quantity" | "note">>
  ) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line))
    );
  }

  function handleSave() {
    const errors = validateForSave(date, lines);
    setValidationErrors(errors);

    if (
      errors.date ||
      errors.lines ||
      errors.lineMenuIds ||
      errors.lineQuantities
    ) {
      return false;
    }

    const draft = buildPlanDraft(date, lines, status);
    if (!draft) return false;

    const now = new Date().toISOString();
    const existing = getSavedPlanByDate(date.trim());

    const savedPlan: SavedProductionPlan = {
      id: existing?.id ?? editingId ?? crypto.randomUUID(),
      date: draft.date,
      status: existing?.status ?? status,
      lines: draft.lines,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    upsertSavedProductionPlan(savedPlan);
    router.push("/production");
    return true;
  }

  return {
    menus,
    isLoaded,
    isEditMode: Boolean(
      editingId ||
        getSavedPlanByDate(date.trim()) ||
        getEffectivePlanByDate(date.trim())
    ),
    versionEntityId: getSavedPlanByDate(date.trim())?.id ?? null,
    date,
    status,
    lines,
    validationErrors,
    preview,
    handleDateChange,
    addLine,
    removeLine,
    updateLine,
    handleSave,
  };
}
