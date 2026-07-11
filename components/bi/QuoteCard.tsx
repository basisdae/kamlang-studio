import { ScrollText } from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { formatBaht } from "../../app/opening/sampleData";
import {
  formatDocDay,
  formatDocTime,
  PARENT_TYPE_LABELS,
  type QuoteDocument,
} from "../../app/opening/documents/sampleData";

type QuoteCardProps = {
  quote: QuoteDocument;
};

/** Quote-focused card — vendor, amount, validity (mock) */
export default function QuoteCard({ quote }: QuoteCardProps) {
  const validLabel = formatDocDay(quote.validUntil);

  return (
    <Card className="space-y-3 !border-[var(--bi-lemon)]">
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.45)]"
          aria-hidden
        >
          <ScrollText className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="kl-type-card-title leading-snug">{quote.title}</p>
            <span className="kl-type-caption shrink-0">
              {formatDocTime(quote.at)}
            </span>
          </div>
          <p className="kl-type-helper mt-1">
            {PARENT_TYPE_LABELS[quote.parentType]} · {quote.parentName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="kl-type-label">ผู้ขาย</p>
          <p className="kl-type-body mt-1">{quote.vendor}</p>
        </div>
        <div>
          <p className="kl-type-label">ยอดเสนอ</p>
          <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
            {quote.amount != null ? formatBaht(quote.amount) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--kl-border)] pt-3">
        <p className="kl-type-helper">
          ใช้ได้ถึง {validLabel} · โดย {quote.person}
        </p>
        <span className="kl-type-caption rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-1">
          Mock · ไม่ใช่ไฟล์จริง
        </span>
      </div>
    </Card>
  );
}
