import type { ProductionPlanStatus } from "./types";
import { PRODUCTION_UI } from "./copy";

export function formatProductionBaht(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export function formatProductionDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function normalizeProductionStatus(
  status: string
): ProductionPlanStatus {
  if (status === "planned" || status === "in_progress") {
    return "preparing";
  }

  if (status === "draft" || status === "preparing" || status === "completed") {
    return status;
  }

  return "draft";
}

export function getProductionStatusLabel(status: ProductionPlanStatus) {
  switch (status) {
    case "draft":
      return PRODUCTION_UI.status.draft;
    case "preparing":
      return PRODUCTION_UI.status.preparing;
    case "completed":
      return PRODUCTION_UI.status.completed;
    default:
      return status;
  }
}

export function getProductionStatusTone(
  status: ProductionPlanStatus
): "draft" | "inProgress" | "completed" {
  switch (status) {
    case "completed":
      return "completed";
    case "preparing":
      return "inProgress";
    case "draft":
      return "draft";
    default:
      return "draft";
  }
}

export function formatProductionQuantity(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

export function todayPlanDate() {
  return new Date().toISOString().slice(0, 10);
}

export function nextPlanDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return todayPlanDate();
  }

  parsed.setDate(parsed.getDate() + 1);
  return parsed.toISOString().slice(0, 10);
}
