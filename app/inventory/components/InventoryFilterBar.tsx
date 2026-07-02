import type { InventoryStatus } from "../types";
import { getInventoryStatusLabel } from "../utils";

type Props = {
  value: InventoryStatus | "all";
  onChange: (value: InventoryStatus | "all") => void;
};

const filters: Array<{ value: InventoryStatus | "all"; label: string }> = [
  { value: "all", label: "ทั้งหมด" },
  { value: "low", label: "ใกล้หมด" },
  { value: "out", label: "หมด" },
];

export default function InventoryFilterBar({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {filters.map((filter) => {
        const isActive = filter.value === value;

        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`kl-type-caption min-h-11 rounded-xl px-2 py-2 kl-pressable ${
              isActive
                ? "bg-[rgb(36_50_74/0.08)] text-kl-primary ring-1 ring-[rgb(36_50_74/0.12)]"
                : "bg-kl-surface text-kl-muted"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export function getInventoryFilterLabel(value: InventoryStatus | "all") {
  if (value === "all") return "ทั้งหมด";
  return getInventoryStatusLabel(value);
}
