import Link from "next/link";
import Card from "../../../components/ui/Card";
import StatCell from "../../../components/ui/StatCell";
import type { Menu } from "../../menu/types";
import type { MenuCostBreakdown } from "../../lib/menuCostService";
import { formatMenuBaht } from "../utils";

type Props = {
  menu: Menu;
  cost: MenuCostBreakdown;
};

export default function MenuLibraryCard({ menu, cost }: Props) {
  return (
    <Card>
      <Link href={`/menus/${menu.id}`} className="block kl-pressable">
        <h2 className="kl-type-card-title">{menu.name}</h2>
        <p className="kl-type-caption mt-1">{menu.category}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatCell
            label="ราคาขาย"
            value={`฿${formatMenuBaht(cost.sellingPrice)}`}
          />
          <StatCell label="กำไร" value={`${cost.grossProfitPercent}%`} />
        </div>
      </Link>
    </Card>
  );
}
