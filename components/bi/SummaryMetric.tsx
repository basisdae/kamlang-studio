type SummaryMetricProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  /** Extra classes on the tile (padding overrides OK with !) */
  className?: string;
  /** Align left for denser summary grids that weren't centered */
  align?: "center" | "start";
};

/**
 * Opening summary tile — locked inset surface metric.
 * Prefer this over local Metric helpers on Opening pages.
 */
export default function SummaryMetric({
  label,
  value,
  hint,
  className = "",
  align = "center",
}: SummaryMetricProps) {
  return (
    <div
      className={`min-w-0 rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 ${
        align === "center" ? "text-center" : "text-left"
      } ${className}`.trim()}
    >
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-metric mt-1 break-all tabular-nums">{value}</p>
      {hint ? (
        <p className="kl-type-caption mt-1 text-kl-muted">{hint}</p>
      ) : null}
    </div>
  );
}
