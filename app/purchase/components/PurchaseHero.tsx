import HeroCard from "../../../components/ui/HeroCard";

type Props = {
  dateLabel: string;
  boughtCount: number;
  totalCount: number;
};

export default function PurchaseHero({
  dateLabel,
  boughtCount,
  totalCount,
}: Props) {
  const remaining = Math.max(totalCount - boughtCount, 0);

  return (
    <HeroCard
      module="purchase"
      label="ซื้อของวันนี้"
      title={`ซื้อแล้ว ${boughtCount}/${totalCount}`}
      subtitle={dateLabel}
    >
      {remaining > 0 ? (
        <div className="kl-hero-stats">
          <div className="kl-hero-stat">
            <div className="kl-hero-stat-value">{remaining}</div>
            <div className="kl-hero-stat-label">ยังเหลือ</div>
          </div>
        </div>
      ) : null}
    </HeroCard>
  );
}
