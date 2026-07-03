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
    />
  );
}
