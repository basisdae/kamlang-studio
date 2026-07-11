import type { LucideIcon } from "lucide-react";
import {
  FileImage,
  FileText,
  Hash,
  Receipt,
  ScrollText,
  Shield,
} from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import {
  formatDocTime,
  KIND_LABELS,
  PARENT_TYPE_LABELS,
  type DocumentKind,
  type OpeningDocument,
} from "../../app/opening/documents/sampleData";

const KIND_ICON: Record<DocumentKind, LucideIcon> = {
  image: FileImage,
  pdf: FileText,
  quote: ScrollText,
  receipt: Receipt,
  warranty: Shield,
  serial: Hash,
};

type DocumentCardProps = {
  document: OpeningDocument;
};

/** Generic document card — รูป / PDF / ใบเสร็จ / Warranty / Serial */
export default function DocumentCard({ document }: DocumentCardProps) {
  const Icon = KIND_ICON[document.kind];

  return (
    <Card className="flex gap-3 !p-3.5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.45)]"
        aria-hidden
      >
        <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="kl-type-card-title leading-snug">{document.title}</p>
          <span className="kl-type-caption shrink-0">
            {formatDocTime(document.at)}
          </span>
        </div>

        <p className="kl-type-caption">{KIND_LABELS[document.kind]}</p>

        {document.detail ? (
          <p className="kl-type-helper truncate">{document.detail}</p>
        ) : null}

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-0.5">
          <p className="kl-type-helper">
            <span className="text-kl-muted">ผูกกับ</span> {document.parentName}
          </p>
          <p className="kl-type-helper">
            <span className="text-kl-muted">หมวด</span>{" "}
            {PARENT_TYPE_LABELS[document.parentType]}
          </p>
          <p className="kl-type-helper">
            <span className="text-kl-muted">โดย</span> {document.person}
          </p>
        </div>
      </div>
    </Card>
  );
}
