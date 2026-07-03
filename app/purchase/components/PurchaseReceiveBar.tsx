"use client";

import { PackageCheck } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import ActionBar from "../../../components/ui/ActionBar";
import Button from "../../../components/ui/Button";

type Props = {
  eligibleCount: number;
  totalCount: number;
  onReceive: () => void;
};

export default function PurchaseReceiveBar({
  eligibleCount,
  totalCount,
  onReceive,
}: Props) {
  const isDisabled = eligibleCount === 0;
  const allChecked = totalCount > 0 && eligibleCount === totalCount;

  let helper: string | null = null;
  if (isDisabled) {
    helper = "ติ๊กของที่ซื้อแล้วก่อน";
  } else if (allChecked) {
    helper = "ซื้อครบแล้ว — กดเอาเข้าครัว";
  }

  return (
    <ActionBar innerClassName="space-y-2">
        {helper ? (
          <p className="kl-type-helper text-center">{helper}</p>
        ) : null}
        <Button fullWidth onClick={onReceive} disabled={isDisabled}>
          <PackageCheck className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          เอาเข้าครัว ({eligibleCount})
        </Button>
    </ActionBar>
  );
}
