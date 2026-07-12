"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, Star } from "lucide-react";
import Card from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import FormField from "../../../../components/ui/FormField";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import type { ActivityLog } from "../../../../lib/types/activity";
import {
  addComment,
  getCommentsForActivity,
  type ActivityComment,
} from "../../../../lib/bi/activityPrefs";
import {
  ACTION_LABELS,
  activityEntityHref,
  formatActivityWhen,
} from "../../lib/workspaceActivity";

type Props = {
  item: ActivityLog;
  pinned: boolean;
  favorited: boolean;
  authorName: string;
  mentionHints: string[];
  onTogglePin: () => void;
  onToggleFavorite: () => void;
};

export default function WorkspaceActivityItem({
  item,
  pinned,
  favorited,
  authorName,
  mentionHints,
  onTogglePin,
  onToggleFavorite,
}: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<ActivityComment[]>(() =>
    getCommentsForActivity(item.id)
  );
  const [draft, setDraft] = useState("");
  const href = activityEntityHref(item);

  function submitComment() {
    if (!draft.trim()) return;
    addComment({
      activityId: item.id,
      body: draft,
      author: authorName,
    });
    setDraft("");
    setComments(getCommentsForActivity(item.id));
  }

  return (
    <Card className={`space-y-2 !p-3.5 ${pinned ? "border border-[var(--bi-lemon)]" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {pinned ? (
              <span className="kl-type-caption rounded-[var(--kl-radius-inner)] bg-[rgb(231_246_91/0.35)] px-2 py-0.5">
                Pin
              </span>
            ) : null}
            <span className="kl-type-caption rounded-[var(--kl-radius-inner)] bg-kl-surface px-2 py-0.5">
              {ACTION_LABELS[item.action] ?? item.action}
            </span>
          </div>
          <p className="kl-type-body mt-1 leading-snug">{item.summary}</p>
          <p className="kl-type-caption mt-1">
            {item.actorName} · {formatActivityWhen(item.createdAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            className="kl-pressable rounded-[var(--kl-radius-inner)] p-2"
            aria-label={favorited ? "เลิก Favorite" : "Favorite"}
            aria-pressed={favorited}
            onClick={onToggleFavorite}
          >
            <Star
              className={KL_ICON_CLASS}
              strokeWidth={KL_ICON_STROKE}
              fill={favorited ? "currentColor" : "none"}
            />
          </button>
          <button
            type="button"
            className="kl-pressable rounded-[var(--kl-radius-inner)] p-2"
            aria-label={pinned ? "เลิก Pin" : "Pin"}
            aria-pressed={pinned}
            onClick={onTogglePin}
          >
            <Pin
              className={KL_ICON_CLASS}
              strokeWidth={KL_ICON_STROKE}
              fill={pinned ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {href ? (
          <Link
            href={href}
            className="kl-type-caption underline text-[var(--bi-text-primary)]"
          >
            เปิดรายการ
          </Link>
        ) : null}
        <button
          type="button"
          className="kl-type-caption underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open
            ? "ซ่อนความคิดเห็น"
            : `ความคิดเห็น${comments.length ? ` (${comments.length})` : ""}`}
        </button>
      </div>

      {open ? (
        <div className="space-y-3 border-t border-[var(--kl-border)] pt-3">
          {comments.length === 0 ? (
            <p className="kl-type-helper">ยังไม่มีความคิดเห็น</p>
          ) : (
            <ul className="space-y-2">
              {comments.map((c) => (
                <li
                  key={c.id}
                  className="rounded-[var(--kl-radius-inner)] bg-kl-surface px-3 py-2"
                >
                  <p className="kl-type-body whitespace-pre-wrap">
                    {renderBodyWithMentions(c.body)}
                  </p>
                  <p className="kl-type-caption mt-1">
                    {c.author} · {formatActivityWhen(c.createdAt)}
                    {c.mentions.length > 0
                      ? ` · mention ${c.mentions.map((m) => `@${m}`).join(" ")}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <FormField label="เพิ่มความคิดเห็น (ใช้ @ชื่อ เพื่อ Mention)">
            <textarea
              className="mt-1.5 w-full min-h-[4.5rem] rounded-[var(--kl-radius-inner)] border border-[var(--kl-border)] bg-kl-card px-3 py-2 text-[length:var(--kl-type-body-size)] outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                mentionHints[0]
                  ? `เช่น ตรวจต่อด้วย @${mentionHints[0]}`
                  : "พิมพ์ข้อความ..."
              }
            />
          </FormField>
          {mentionHints.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {mentionHints.slice(0, 5).map((name) => (
                <button
                  key={name}
                  type="button"
                  className="kl-type-caption rounded-full bg-kl-surface px-2 py-1 kl-pressable"
                  onClick={() =>
                    setDraft((d) => `${d}${d.endsWith(" ") || !d ? "" : " "}@${name} `)
                  }
                >
                  @{name}
                </button>
              ))}
            </div>
          ) : null}
          <Button
            type="button"
            fullWidth
            className="min-h-[2.5rem]"
            disabled={!draft.trim()}
            onClick={submitComment}
          >
            บันทึกความคิดเห็น
          </Button>
          <p className="kl-type-caption">
            Comment เก็บในเครื่อง (UI pref) · ยังไม่เขียนลง Database
          </p>
        </div>
      ) : null}
    </Card>
  );
}

function renderBodyWithMentions(body: string) {
  const parts = body.split(/(@[\u0E00-\u0E7Fa-zA-Z0-9_.-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-medium text-[var(--bi-text-primary)]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
