import HeroCard from "../../../components/ui/HeroCard";

type Props = {
  totalItems: number;
  lowCount: number;
  outCount: number;
};

export default function InventoryHero({
  totalItems,
  lowCount,
  outCount,
}: Props) {
  const alertCount = lowCount + outCount;

  return (
    <HeroCard
      module="inventory"
      label="สรุปของในครัว"
      title={`${totalItems} รายการ`}
      subtitle={alertCount > 0 ? `ควรดู ${alertCount} รายการ` : "ของพอใช้"}
    >
      <div className="kl-hero-stats">
        <div className="kl-hero-stat">
          <div className="kl-hero-stat-value">{lowCount}</div>
          <div className="kl-hero-stat-label">ใกล้หมด</div>
        </div>
        <div className="kl-hero-stat">
          <div className="kl-hero-stat-value">{outCount}</div>
          <div className="kl-hero-stat-label">หมด</div>
        </div>
      </div>
    </HeroCard>
  );
}
