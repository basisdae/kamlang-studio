"use client";

import Card from "../ui/Card";
import Button from "../ui/Button";
import { formatBaht } from "../../app/opening/sampleData";
import {
  PARTNER_STATUS_LABELS,
  type PartnerRecord,
} from "../../lib/partners/types";

type PartnerCardProps = {
  partner: PartnerRecord;
  onEdit: () => void;
  onArchive: () => void;
  onOpenDetail: () => void;
};

export default function PartnerCard({
  partner,
  onEdit,
  onArchive,
  onOpenDetail,
}: PartnerCardProps) {
  return (
    <Card className="space-y-3">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left kl-pressable"
        onClick={onOpenDetail}
        aria-label={`ดูรายละเอียด ${partner.name}`}
      >
        <div className="min-w-0">
          <h3 className="kl-type-card-title">{partner.name}</h3>
          <p className="kl-type-helper mt-1">
            {partner.category}
            {partner.role ? ` · ${partner.role}` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.55)] px-2 py-1 kl-type-caption text-[var(--bi-text-primary)]">
          {PARTNER_STATUS_LABELS[partner.status]}
        </span>
      </button>

      {partner.investment != null || partner.percent != null ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="kl-type-label">เงินลงทุน</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {partner.investment != null
                ? formatBaht(partner.investment)
                : "—"}
            </p>
          </div>
          <div>
            <p className="kl-type-label">เปอร์เซ็นต์</p>
            <p className="kl-type-metric mt-1 text-[length:var(--kl-type-body-size)]">
              {partner.percent != null ? `${partner.percent}%` : "—"}
            </p>
          </div>
        </div>
      ) : null}

      {partner.note ? (
        <p className="kl-type-body text-kl-muted">{partner.note}</p>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" fullWidth size="sm" onClick={onOpenDetail}>
          ดู
        </Button>
        <Button variant="secondary" fullWidth size="sm" onClick={onEdit}>
          แก้ไข
        </Button>
        <Button variant="secondary" fullWidth size="sm" onClick={onArchive}>
          Archive
        </Button>
      </div>
    </Card>
  );
}
