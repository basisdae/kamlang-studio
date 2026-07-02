import { ChevronRight } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";import { getIngredientById } from "../../ingredients/IngredientRepository";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import CategoryChip from "../../../components/ui/CategoryChip";
import { formatProductionQuantity } from "../../production/utils";
import type { InventoryItem } from "../types";
import type { InventoryStatus } from "../types";
import { getInventoryStatus, getInventoryStatusLabel } from "../utils";

type Props = {
  item: InventoryItem;
  note?: string;
  onSelect: () => void;
};

function getStatusTone(status: InventoryStatus) {
  if (status === "low") return "draft" as const;
  if (status === "out") return "critical" as const;
  return "ready" as const;
}

export default function InventoryCard({ item, note, onSelect }: Props) {
  const ingredient = getIngredientById(item.ingredientId);
  const name = ingredient?.name ?? "ไม่พบวัตถุดิบ";
  const status = getInventoryStatus(item);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="block w-full text-left kl-pressable"
    >
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="kl-type-card-title break-words">{name}</h2>
            {ingredient ? (
              <div className="mt-1.5">
                <CategoryChip category={ingredient.category} />
              </div>
            ) : null}
            <p className="kl-type-caption mt-0.5">
              ขั้นต่ำ {formatProductionQuantity(item.minQuantity)} {item.unit}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge tone={getStatusTone(status)}>
              {getInventoryStatusLabel(status)}
            </Badge>
            <ChevronRight
              className={`${KL_ICON_CLASS} text-kl-muted`}
              strokeWidth={KL_ICON_STROKE}
            />
          </div>
        </div>

        <div className="kl-card-emphasis">
          <div className="kl-type-label">คงเหลือ</div>
          <div className="kl-type-metric-lg mt-1">
            {formatProductionQuantity(item.stockQuantity)}{" "}
            <span className="kl-type-caption text-kl-muted">{item.unit}</span>
          </div>
        </div>

        {note ? (
          <p className="kl-type-helper">หมายเหตุ: {note}</p>
        ) : null}
      </Card>
    </button>
  );
}
