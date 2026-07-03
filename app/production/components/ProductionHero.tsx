import type { ReactNode } from "react";
import HeroCard from "../../../components/ui/HeroCard";
import { formatProductionQuantity } from "../utils";

type Props = {
  dateLabel: string;
  totalDishes: number;
  menuCount: number;
  actions?: ReactNode;
};

export default function ProductionHero({
  dateLabel,
  totalDishes,
  menuCount,
  actions,
}: Props) {
  return (
    <HeroCard
      module="production"
      label="แผนวันนี้"
      title={`${formatProductionQuantity(totalDishes)} จาน`}
      subtitle={dateLabel}
    >
      <div className="kl-hero-stats">
        <div className="kl-hero-stat">
          <div className="kl-hero-stat-value">{menuCount}</div>
          <div className="kl-hero-stat-label">รายการ</div>
        </div>
      </div>
      {actions}
    </HeroCard>
  );
}
