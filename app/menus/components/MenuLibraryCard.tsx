import Link from "next/link";
import Badge from "../../../components/ui/Badge";
import Card from "../../../components/ui/Card";
import StatCell from "../../../components/ui/StatCell";
import type { Menu } from "../../menu/types";
import type { MenuCostBreakdown } from "../../lib/menuCostService";
import { formatMenuBaht } from "../utils";

type Props = {
  menu: Menu;
  cost: MenuCostBreakdown;
  href?: string;
  showDraftBadge?: boolean;
};

export default function MenuLibraryCard({
  menu,
  cost,
  href,
  showDraftBadge,
}: Props) {
  const target = href ?? `/menus/${menu.id}`;

  return (
    <Card>
      <Link href={target} className="block kl-pressable">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="kl-type-card-title">{menu.name}</h2>
            {menu.category ? (
              <p className="kl-type-caption mt-1">{menu.category}</p>
            ) : (
              <p className="kl-type-caption mt-1 text-kl-muted">
                ยังไม่ตั้งหมวด
              </p>
            )}
          </div>
          {showDraftBadge || !menu.isActive ? (
            <Badge tone="draft">แบบร่าง</Badge>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <StatCell
            label="ราคาขาย"
            value={
              cost.sellingPrice > 0
                ? `฿${formatMenuBaht(cost.sellingPrice)}`
                : "ยังไม่ตั้ง"
            }
          />
          <StatCell
            label="กำไร"
            value={
              cost.sellingPrice > 0 ? `${cost.grossProfitPercent}%` : "—"
            }
          />
        </div>
      </Link>
    </Card>
  );
}
