import Link from "next/link";
import Card from "../ui/Card";

type MetricCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
};

/** Layer 1/3 — metric; pass href to keep numbers drillable */
export default function MetricCard({
  label,
  value,
  hint,
  href,
}: MetricCardProps) {
  const body = (
    <>
      <p className="kl-type-label">{label}</p>
      <p className="kl-type-metric break-words">{value}</p>
      {hint ? <p className="kl-type-helper">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block kl-pressable">
        <Card className="space-y-1.5 !p-4">{body}</Card>
      </Link>
    );
  }

  return <Card className="space-y-1.5 !p-4">{body}</Card>;
}
