import { UtensilsCrossed } from "lucide-react";
import {
  KL_ICON_DISPLAY_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import Card from "../../../../components/ui/Card";import type { Menu } from "../../../menu/types";
import { formatMenuBaht } from "../../utils";

type Props = {
  menu: Menu;
  sellingPrice: number;
};

export default function MenuHero({ menu, sellingPrice }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex aspect-[16/10] items-center justify-center bg-kl-surface">
        <UtensilsCrossed
          className={`${KL_ICON_DISPLAY_CLASS} text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
        />      </div>

      <div className="space-y-4 kl-card-body">
        <div className="kl-card-emphasis text-center">
          <div className="kl-type-label">ราคาขาย</div>
          <div className="kl-type-metric-lg mt-1">
            ฿{formatMenuBaht(sellingPrice)}
          </div>
        </div>
      </div>
    </Card>
  );
}
