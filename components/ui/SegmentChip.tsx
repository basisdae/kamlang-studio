"use client";

import Link from "next/link";

type SegmentChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
};

/**
 * Filter / tab chip — locked to kl-segment-btn + lemon active.
 */
export default function SegmentChip({
  label,
  active = false,
  onClick,
  href,
  className = "",
}: SegmentChipProps) {
  const classes = `kl-segment-btn shrink-0 whitespace-nowrap kl-pressable ${
    active
      ? "bg-[var(--bi-lemon)] text-[var(--bi-text-primary)]"
      : "bg-kl-surface text-kl-muted"
  } ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes} aria-current={active ? "page" : undefined}>
        {label}
      </Link>
    );
  }

  if (!onClick) {
    return (
      <span className={classes} aria-current={active ? "true" : undefined}>
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
