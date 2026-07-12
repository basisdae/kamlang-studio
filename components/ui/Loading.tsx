import BiListSkeleton from "../bi/BiListSkeleton";
import Skeleton from "./Skeleton";

type LoadingProps = {
  /** Full list placeholder (Opening pages) */
  variant?: "list" | "block" | "inline";
  rows?: number;
  className?: string;
  label?: string;
};

/**
 * Locked loading states for Opening OS.
 * Prefer BiDataStatus on data pages — this covers ad-hoc placeholders.
 */
export default function Loading({
  variant = "list",
  rows = 4,
  className = "",
  label = "กำลังโหลด...",
}: LoadingProps) {
  if (variant === "list") {
    return <BiListSkeleton rows={rows} />;
  }

  if (variant === "inline") {
    return (
      <p className={`kl-type-caption text-kl-muted ${className}`.trim()} role="status">
        {label}
      </p>
    );
  }

  return (
    <div className={`space-y-2 ${className}`.trim()} role="status" aria-label={label}>
      <Skeleton className="h-4 w-2/3 rounded-[var(--kl-radius-inner)]" />
      <Skeleton className="h-20 w-full rounded-[var(--kl-radius-inner)]" />
      <Skeleton className="h-4 w-1/2 rounded-[var(--kl-radius-inner)]" />
    </div>
  );
}
