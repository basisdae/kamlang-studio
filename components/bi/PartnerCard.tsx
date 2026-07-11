import Card from "../ui/Card";
import { formatBaht } from "../../app/opening/sampleData";
import {
  PARTNER_STATUS_LABELS,
  type Partner,
} from "../../app/partners/sampleData";

type PartnerCardProps = {
  partner: Partner;
};

export default function PartnerCard({ partner }: PartnerCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="kl-type-card-title">{partner.name}</h3>
          <p className="kl-type-helper mt-1">{partner.role}</p>
        </div>
        <span className="shrink-0 rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.55)] px-2 py-1 kl-type-caption text-[var(--bi-text-primary)]">
          {PARTNER_STATUS_LABELS[partner.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="kl-type-label">เงินลงทุน</p>
          <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
            {formatBaht(partner.investment)}
          </p>
        </div>
        <div>
          <p className="kl-type-label">เปอร์เซ็นต์</p>
          <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
            {partner.percent}%
          </p>
        </div>
      </div>

      <div>
        <p className="kl-type-label">ความรับผิดชอบ</p>
        <p className="kl-type-body mt-1">{partner.responsibility}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-[var(--kl-border)] pt-3">
        <Placeholder label="การคืนทุน" />
        <Placeholder label="เงินปันผล" />
        <Placeholder label="เบิกคืน" />
      </div>
    </Card>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-2 text-center">
      <p className="kl-type-caption">{label}</p>
      <p className="kl-type-helper mt-1">เร็วๆ นี้</p>
    </div>
  );
}
