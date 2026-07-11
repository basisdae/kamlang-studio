import Card from "../ui/Card";

type SummaryCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function SummaryCard({
  title,
  children,
  footer,
  className = "",
}: SummaryCardProps) {
  return (
    <Card className={`space-y-4 ${className}`.trim()}>
      <h2 className="kl-type-card-title">{title}</h2>
      {children}
      {footer ? <div className="pt-1">{footer}</div> : null}
    </Card>
  );
}
