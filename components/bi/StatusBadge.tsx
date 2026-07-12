import Badge, { type BadgeTone } from "../ui/Badge";
import {
  ASSET_PRIORITY_LABELS,
  ASSET_STATUS_LABELS,
  type AssetPriority,
  type AssetStatus,
} from "../../data/seed/tangtao";
import type { OpeningUxStatus } from "../../app/opening/lib/openingDomain";

type StatusBadgeProps = {
  children?: React.ReactNode;
  tone?: BadgeTone;
  uxStatus?: OpeningUxStatus;
  assetStatus?: AssetStatus;
  priority?: AssetPriority;
  className?: string;
};

const UX_LABEL: Record<OpeningUxStatus, string> = {
  owned: "มีแล้ว",
  need: "ต้องจัดหา",
  ordered: "สั่งแล้ว",
  received: "ได้รับแล้ว",
  other: "อื่นๆ",
};

const UX_TONE: Record<OpeningUxStatus, BadgeTone> = {
  owned: "ready",
  received: "ready",
  ordered: "inProgress",
  need: "draft",
  other: "neutral",
};

const ASSET_TONE: Partial<Record<AssetStatus, BadgeTone>> = {
  planned: "draft",
  awaiting_quote: "draft",
  ready_to_buy: "info",
  ordered: "inProgress",
  awaiting_delivery: "inProgress",
  received: "ready",
  in_use: "completed",
  repairing: "warning",
  broken: "critical",
  retired: "neutral",
};

const PRIORITY_TONE: Record<AssetPriority, BadgeTone> = {
  must: "critical",
  should: "draft",
  nice: "neutral",
};

/**
 * Locked status / priority badge for Opening OS.
 * Maps owner UX + asset pipeline onto shared Badge tones.
 */
export default function StatusBadge({
  children,
  tone,
  uxStatus,
  assetStatus,
  priority,
  className = "",
}: StatusBadgeProps) {
  let resolvedTone: BadgeTone = tone ?? "neutral";
  let label: React.ReactNode = children;

  if (uxStatus) {
    resolvedTone = tone ?? UX_TONE[uxStatus];
    label = children ?? UX_LABEL[uxStatus];
  } else if (assetStatus) {
    resolvedTone = tone ?? ASSET_TONE[assetStatus] ?? "neutral";
    label = children ?? ASSET_STATUS_LABELS[assetStatus];
  } else if (priority) {
    resolvedTone = tone ?? PRIORITY_TONE[priority];
    label = children ?? ASSET_PRIORITY_LABELS[priority];
  }

  return (
    <span className={className || undefined}>
      <Badge tone={resolvedTone}>{label}</Badge>
    </span>
  );
}
