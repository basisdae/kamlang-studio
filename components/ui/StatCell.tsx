type StatCellProps = {
  label: string;
  value: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export default function StatCell({
  label,
  value,
  size = "md",
  className = "",
}: StatCellProps) {
  const metricClass =
    size === "lg" ? "kl-type-metric-lg" : "kl-type-metric";

  return (
    <div className={`kl-stat ${className}`}>
      <div className="kl-type-label">{label}</div>
      <div className={`mt-1.5 ${metricClass}`}>{value}</div>
    </div>
  );
}
