import type { LucideIcon } from "lucide-react";
import {
  KL_ICON_LG_CLASS,
  KL_ICON_STROKE,
} from "../../components/layout/navConfig";
import Button from "./Button";
import ButtonLink from "./ButtonLink";

type EmptyStateProps = {
  title: string;
  hint: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
};

export default function EmptyState({
  title,
  hint,
  actionLabel,
  actionHref,
  onAction,
  icon: Icon,
  className = "",
}: EmptyStateProps) {
  const showLink = Boolean(actionLabel && actionHref);
  const showButton = Boolean(actionLabel && onAction && !actionHref);

  return (
    <div className={`kl-empty space-y-3 ${className}`.trim()}>
      {Icon ? (
        <Icon
          className={`mx-auto ${KL_ICON_LG_CLASS} text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
          aria-hidden
        />
      ) : null}

      <div className="space-y-1.5">
        <p className="kl-type-card-title text-kl-text">{title}</p>
        <p className="kl-type-helper text-kl-muted">{hint}</p>
      </div>

      {showLink ? (
        <ButtonLink href={actionHref!} fullWidth className="mx-auto max-w-xs">
          {actionLabel}
        </ButtonLink>
      ) : null}

      {showButton ? (
        <Button
          type="button"
          fullWidth
          onClick={onAction}
          className="mx-auto max-w-xs"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
