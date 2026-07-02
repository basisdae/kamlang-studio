import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import { formatProductionDate } from "../../production/utils";
import type { PurchaseList } from "../types";

type Props = {
  purchaseList: PurchaseList;
};

export default function PurchaseListHeader({ purchaseList }: Props) {
  return (
    <Link
      href="/production"
      className="kl-section flex items-center justify-between gap-3 kl-pressable"
    >
      <div>
        <div className="kl-type-label">จากแผนผลิต</div>
        <div className="kl-type-card-title mt-1">
          {formatProductionDate(purchaseList.planDate)}
        </div>
      </div>
      <ChevronRight
        className={`${KL_ICON_CLASS} shrink-0 text-kl-muted`}
        strokeWidth={KL_ICON_STROKE}
      />
    </Link>
  );
}
