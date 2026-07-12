/**
 * Design System Lock — Opening OS / Business Insight
 * Source of truth: app/globals.css (--bi-* / --kl-*) + docs/03-design-system.md
 *
 * Rules (no UX redesign):
 * - Colors: only CSS tokens (--bi-* preferred; --kl-* aliases OK)
 * - Type: kl-type-* classes only
 * - Buttons: Button / ButtonLink / IconButton
 * - Cards: Card / SummaryCard
 * - Status: Badge / StatusBadge / PriorityBadge / StatusChip
 * - Dialogs: Dialog (+ ArchiveConfirm)
 * - Empty: EmptyState
 * - Loading: BiDataStatus skeleton / BiListSkeleton / Skeleton
 * - Spacing: --kl-space-* / existing Tailwind gap-2/3/4 patterns
 * - Icons: lucide-react + KL_ICON_* + KL_ICON_STROKE from navConfig
 */

export {
  KL_ICON_CLASS,
  KL_ICON_SM_CLASS,
  KL_ICON_LG_CLASS,
  KL_ICON_XL_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";

/** Shared form control class — Opening AssetForm / Quick Add / Procurement */
export const KL_FIELD_CLASS =
  "mt-1.5 w-full min-h-[2.75rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3 text-[length:var(--kl-type-body-size)] outline-none";

export const KL_FIELD_COMPACT_CLASS =
  "w-full min-h-[2.25rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-2 text-[length:var(--kl-type-body-size)] outline-none";
