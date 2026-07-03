export type StatusBadgeTone =
  | "draft"
  | "ready"
  | "inProgress"
  | "completed"
  | "critical";

/** @deprecated Prefer StatusBadgeTone — mapped to premium status colors */
type LegacyBadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

export type BadgeTone = StatusBadgeTone | LegacyBadgeTone;

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const toneClass: Record<BadgeTone, string> = {
  draft: "kl-badge-draft",
  ready: "kl-badge-ready",
  inProgress: "kl-badge-inprogress",
  completed: "kl-badge-completed",
  critical: "kl-badge-critical",
  neutral: "kl-badge-neutral",
  success: "kl-badge-ready",
  warning: "kl-badge-draft",
  danger: "kl-badge-critical",
  info: "kl-badge-inprogress",
};

export default function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`kl-badge kl-type-label ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
