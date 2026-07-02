"use client";

import { PackageCheck } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import Button from "../../../components/ui/Button";

type Props = {
  eligibleCount: number;
  onReceive: () => void;
};

export default function PurchaseReceiveBar({
  eligibleCount,
  onReceive,
}: Props) {
  const isDisabled = eligibleCount === 0;

  return (
    <div className="kl-action-bar">
      <div className="kl-action-bar-inner">
        <Button fullWidth onClick={onReceive} disabled={isDisabled}>
          <PackageCheck className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          เอาเข้าครัว ({eligibleCount})
        </Button>
      </div>
    </div>
  );
}
