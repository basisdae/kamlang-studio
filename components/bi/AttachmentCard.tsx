"use client";

import { Paperclip, Plus } from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import {
  ATTACHABLE_KINDS,
  KIND_LABELS,
  PARENT_TYPE_LABELS,
  type DocumentKind,
  type DocumentParentType,
  type OpeningDocument,
} from "../../app/opening/documents/sampleData";

type AttachmentCardProps = {
  parentType: DocumentParentType;
  parentName: string;
  documents: OpeningDocument[];
};

/**
 * Parent-item attachment strip — shows which kinds are attached.
 * Mock only: button does not upload.
 */
export default function AttachmentCard({
  parentType,
  parentName,
  documents,
}: AttachmentCardProps) {
  const attached = new Set(documents.map((d) => d.kind));

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Paperclip
              className={KL_ICON_CLASS}
              strokeWidth={KL_ICON_STROKE}
              aria-hidden
            />
            <h3 className="kl-type-card-title truncate">{parentName}</h3>
          </div>
          <p className="kl-type-helper mt-1">
            {PARENT_TYPE_LABELS[parentType]} · แนบได้{" "}
            {ATTACHABLE_KINDS.length} ประเภท
          </p>
        </div>
        <span className="kl-type-caption shrink-0 tabular-nums">
          {documents.length} ไฟล์
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ATTACHABLE_KINDS.map((kind) => (
          <KindChip key={kind} kind={kind} attached={attached.has(kind)} />
        ))}
      </div>

      <button
        type="button"
        className="kl-btn kl-btn-secondary flex w-full min-h-[2.75rem] items-center justify-center gap-2 kl-pressable"
        onClick={() => {
          /* Mock UI — no real upload */
        }}
      >
        <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        <span>แนบเอกสาร (Mock)</span>
      </button>
    </Card>
  );
}

function KindChip({
  kind,
  attached,
}: {
  kind: DocumentKind;
  attached: boolean;
}) {
  return (
    <span
      className={`rounded-[var(--kl-radius-inner)] px-2 py-1 kl-type-caption ${
        attached
          ? "bg-[rgb(231_246_91/0.55)] text-[var(--bi-text-primary)]"
          : "bg-kl-surface text-kl-muted"
      }`}
    >
      {KIND_LABELS[kind]}
      {attached ? " ✓" : ""}
    </span>
  );
}
