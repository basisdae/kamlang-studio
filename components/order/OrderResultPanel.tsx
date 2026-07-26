"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  MessageCircle,
  QrCode,
  XCircle,
} from "lucide-react";
import { ORDER_TRIAL_RESULT_BANNER } from "../../lib/order/config";

export type OrderResultKind =
  | "trial_preview"
  | "waiting_confirm"
  | "line_handoff"
  | "external_link"
  | "qr_ready"
  | "loading"
  | "error"
  | "failed";

type Props = {
  kind: OrderResultKind;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  busy?: boolean;
  showTrialBanner?: boolean;
};

const ICON: Record<OrderResultKind, LucideIcon> = {
  trial_preview: ClipboardCheck,
  waiting_confirm: Loader2,
  line_handoff: MessageCircle,
  external_link: ExternalLink,
  qr_ready: QrCode,
  loading: Loader2,
  error: AlertTriangle,
  failed: XCircle,
};

function toneClass(kind: OrderResultKind): string {
  if (kind === "error" || kind === "failed") {
    return "bg-[var(--order-error-soft)] text-[var(--order-error)]";
  }
  if (kind === "waiting_confirm" || kind === "loading") {
    return "bg-[var(--order-warning-soft)] text-[var(--order-warning)]";
  }
  if (kind === "trial_preview") {
    return "bg-[var(--order-accent-soft)] text-[var(--order-accent)]";
  }
  return "bg-[var(--order-accent)] text-[var(--order-accent-ink)]";
}

export default function OrderResultPanel({
  kind,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  busy = false,
  showTrialBanner = true,
}: Props) {
  const Icon = ICON[kind];
  const spin = kind === "loading" || kind === "waiting_confirm" || busy;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 text-center">
      {showTrialBanner ? (
        <p className="mb-6 w-full rounded-[var(--order-radius-sm)] border border-[var(--order-accent)]/30 bg-[var(--order-accent-soft)] px-3 py-2 text-[13px] font-medium text-[var(--order-accent)]">
          {ORDER_TRIAL_RESULT_BANNER}
        </p>
      ) : null}

      <div
        className={`mb-5 flex h-20 w-20 items-center justify-center rounded-full ${toneClass(kind)}`}
      >
        <Icon
          className={`h-10 w-10 ${spin ? "animate-spin" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>

      <h2 className="text-[22px] font-semibold tracking-tight text-[var(--order-text)]">
        {title}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--order-text-muted)]">
        {description}
      </p>

      {kind === "qr_ready" ? (
        <div className="mt-6 flex h-44 w-44 items-center justify-center rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] shadow-[var(--order-shadow)]">
          <QrCode
            className="h-24 w-24 text-[var(--order-text)]"
            strokeWidth={1.5}
            aria-hidden
          />
        </div>
      ) : null}

      <button
        type="button"
        disabled={busy || kind === "loading"}
        onClick={onPrimary}
        className="mt-8 flex min-h-[52px] w-full items-center justify-center rounded-[var(--order-radius)] bg-[var(--order-accent)] text-[16px] font-semibold text-[var(--order-accent-ink)] disabled:cursor-not-allowed disabled:bg-[var(--order-disabled-bg)] disabled:text-[var(--order-disabled)]"
      >
        {primaryLabel}
      </button>

      {secondaryLabel && onSecondary ? (
        <button
          type="button"
          disabled={busy}
          onClick={onSecondary}
          className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-[var(--order-radius)] border border-[var(--order-border)] bg-[var(--order-card)] text-[15px] font-medium text-[var(--order-text)]"
        >
          {secondaryLabel}
        </button>
      ) : null}
    </div>
  );
}
