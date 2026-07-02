import HeroCard from "../../../components/ui/HeroCard";
import { formatProductionQuantity } from "../utils";

type Props = {
  dateLabel: string;
  totalDishes: number;
  menuCount: number;
  statusLabel: string;
};

export default function ProductionHero({
  dateLabel,
  totalDishes,
  menuCount,
  statusLabel,
}: Props) {
  return (
    <HeroCard
      module="production"
      label="แผนผลิตวันนี้"
      title={`${formatProductionQuantity(totalDishes)} จาน`}
      subtitle={dateLabel}
    >
      <div className="kl-hero-stats">
        <div className="kl-hero-stat">
          <div className="kl-hero-stat-value">{menuCount}</div>
          <div className="kl-hero-stat-label">รายการ</div>
        </div>
        <div className="kl-hero-stat">
          <div className="kl-hero-stat-value">{statusLabel}</div>
          <div className="kl-hero-stat-label">ขั้นตอน</div>
        </div>
      </div>
    </HeroCard>
  );
}
