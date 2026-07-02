import { getIngredientById } from "../../ingredients/IngredientRepository";
import Badge from "../../../components/ui/Badge";
import type { InventoryItem } from "../../inventory/types";
import { HOME_UI } from "../copy";
import HomeSectionHeader from "./HomeSectionHeader";

type Props = {
  title: string;
  href: string;
  actionLabel: string;
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
};

function ItemRow({
  item,
  tone,
  label,
}: {
  item: InventoryItem;
  tone: "critical" | "draft";
  label: string;
}) {
  const ingredient = getIngredientById(item.ingredientId);
  const name = ingredient?.name ?? "ไม่พบวัตถุดิบ";

  return (
    <div className="kl-list-row">
      <div className="kl-type-body min-w-0 flex-1 break-words">{name}</div>
      <Badge tone={tone}>{label}</Badge>
    </div>
  );
}

export default function HomeInventoryAlerts({
  title,
  href,
  actionLabel,
  lowStockItems,
  outOfStockItems,
}: Props) {
  return (
    <div className="kl-section space-y-4">
      <HomeSectionHeader
        title={title}
        href={href}
        actionLabel={actionLabel}
        module="inventory"
      />

      <div className="kl-list">
        {outOfStockItems.map((item) => (
          <ItemRow
            key={item.ingredientId}
            item={item}
            tone="critical"
            label={HOME_UI.stock.out}
          />
        ))}
        {lowStockItems.map((item) => (
          <ItemRow
            key={item.ingredientId}
            item={item}
            tone="draft"
            label={HOME_UI.stock.low}
          />
        ))}
      </div>
    </div>
  );
}
