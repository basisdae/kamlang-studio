"use client";

import Card from "../../../../components/ui/Card";
import StepperButton from "../../../../components/ui/StepperButton";

type Props = {
  batchSize: number;
  yieldUnit: string;
  onDecrease: () => void;
  onIncrease: () => void;
};

export default function BatchSizeControl({
  batchSize,
  yieldUnit,
  onDecrease,
  onIncrease,
}: Props) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <span className="kl-type-card-title">ผลิต</span>

      <div className="flex items-center gap-2.5">
        <StepperButton
          kind="decrement"
          onClick={onDecrease}
          disabled={batchSize <= 1}
          aria-label="ลดจำนวนชุด"
        />

        <span className="kl-type-metric-lg min-w-[2ch] text-center">
          {batchSize}
        </span>

        <StepperButton
          kind="increment"
          onClick={onIncrease}
          aria-label="เพิ่มจำนวนชุด"
        />

        <span className="kl-type-caption pl-1 text-kl-muted">{yieldUnit}</span>
      </div>
    </Card>
  );
}
