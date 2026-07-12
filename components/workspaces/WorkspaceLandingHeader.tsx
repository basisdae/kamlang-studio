import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import type { WorkspaceAccent } from "../../lib/workspaces/types";
import { workspaceAccentStyle } from "../../lib/workspaces/workspaceAccent";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../layout/navConfig";

type Props = {
  title: string;
  description?: string;
  icon: LucideIcon;
  accent: WorkspaceAccent;
};

/** Compact landing title — Lucide icon + accent, no emoji. */
export default function WorkspaceLandingHeader({
  title,
  description,
  icon: Icon,
  accent,
}: Props) {
  const style = workspaceAccentStyle(accent) as CSSProperties;

  return (
    <header className="space-y-1" style={style}>
      <p className="kl-type-page-title flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--kl-radius-inner)]"
          style={{
            background: "var(--ws-accent-soft)",
            color: "var(--ws-accent)",
          }}
          aria-hidden
        >
          <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </span>
        <span>{title}</span>
      </p>
      {description ? (
        <p className="kl-type-helper pl-[2.875rem]">{description}</p>
      ) : null}
    </header>
  );
}
