import { AlertTriangle } from "lucide-react";
import { KL_ICON_SM_CLASS, KL_ICON_STROKE } from "../layout/navConfig";

export type SummaryMetricTone =
  | "neutral"
  | "primary"
  | "accent"
  | "success"
  | "muted"
  | "warning";

type SummaryMetricProps = {
  label: string;
  value?: React.ReactNode;
  /** Renders amount + lighter “บาท” (preferred for money metrics). */
  amount?: number;
  hint?: string;
  className?: string;
  align?: "center" | "start";
  /**
   * Color only decision / action signals — not every tile.
   * primary = navy · accent = ต้องจัดหา · success = มีแล้ว / ซื้อจริง>0 · muted = 0 · warning = ข้อมูลไม่ครบ
   */
  tone?: SummaryMetricTone;
  /** Amber warning summary (e.g. ยังไม่มีราคา · N รายการ). */
  warning?: boolean;
};

function MoneyValue({ amount }: { amount: number }) {
  return (
    <span className="inline-flex items-baseline justify-center gap-1">
      <span className="tabular-nums">{amount.toLocaleString("th-TH")}</span>
      <span className="text-[0.62em] font-normal tracking-normal opacity-60">
        บาท
      </span>
    </span>
  );
}

const TONE_TILE: Record<SummaryMetricTone, string> = {
  neutral: "",
  primary: "",
  accent: "bg-[color-mix(in_srgb,var(--bi-lemon)_42%,white)]",
  success: "",
  muted: "",
  warning: "bg-kl-warning",
};

const TONE_VALUE: Record<SummaryMetricTone, string> = {
  neutral: "text-[var(--bi-text-primary)] font-semibold",
  primary: "text-[var(--bi-text-primary)] font-semibold",
  accent: "text-[var(--bi-text-primary)] font-bold",
  success: "text-kl-success-text font-semibold",
  muted: "text-kl-muted font-semibold",
  warning: "text-kl-warning-text font-semibold",
};

/**
 * Opening / Finance summary tile.
 * Color hierarchy: only tone action/decision metrics — labels stay muted gray.
 */
export default function SummaryMetric({
  label,
  value,
  amount,
  hint,
  className = "",
  align = "center",
  tone = "neutral",
  warning = false,
}: SummaryMetricProps) {
  const resolvedTone: SummaryMetricTone = warning ? "warning" : tone;
  const display =
    amount != null ? <MoneyValue amount={amount} /> : (value ?? "—");

  return (
    <div
      className={`min-w-0 rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 ${
        TONE_TILE[resolvedTone]
      } ${align === "center" ? "text-center" : "text-left"} ${className}`.trim()}
    >
      {warning ? (
        <p
          className={`flex items-center gap-1 kl-type-caption font-medium text-kl-warning-text ${
            align === "center" ? "justify-center" : ""
          }`}
        >
          <AlertTriangle
            className={KL_ICON_SM_CLASS}
            strokeWidth={KL_ICON_STROKE}
            aria-hidden
          />
          <span>{label}</span>
        </p>
      ) : (
        <p className="kl-type-caption text-kl-muted">{label}</p>
      )}
      <p
        className={`kl-type-metric mt-1 break-all tabular-nums ${TONE_VALUE[resolvedTone]}`}
      >
        {display}
      </p>
      {hint ? (
        <p className="kl-type-caption mt-1 text-kl-muted">{hint}</p>
      ) : null}
    </div>
  );
}
