import {
  DATA_SOURCE_LABELS,
  type DataSource,
} from "./dataSource";

type DataSourceBadgeProps = {
  source?: DataSource;
  className?: string;
};

export default function DataSourceBadge({
  source = "sample",
  className = "",
}: DataSourceBadgeProps) {
  const isMuted = source === "sample";

  return (
    <span
      className={`inline-flex min-h-[2rem] items-center rounded-full border px-3 text-[length:var(--kl-type-label-size)] font-medium ${
        isMuted
          ? "border-[var(--kl-border)] bg-[var(--bi-surface-muted)] text-[var(--bi-text-secondary)]"
          : "border-[var(--bi-lemon)] bg-[rgb(231_246_91/0.35)] text-[var(--bi-text-primary)]"
      } ${className}`.trim()}
      data-source={source}
      role="status"
    >
      {DATA_SOURCE_LABELS[source]}
    </span>
  );
}
