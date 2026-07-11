import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";

type SectionHeaderProps = {
  title: string;
  href?: string;
  actionLabel?: string;
};

export default function SectionHeader({
  title,
  href,
  actionLabel,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="kl-type-section-title kl-section-title min-w-0 truncate">
        {title}
      </h2>
      {href && actionLabel ? (
        <Link
          href={href}
          className="kl-tap-link inline-flex items-center gap-0.5 text-[length:var(--kl-type-label-size)] font-medium text-kl-muted"
        >
          {actionLabel}
          <ChevronRight
            className={KL_ICON_CLASS}
            strokeWidth={KL_ICON_STROKE}
          />
        </Link>
      ) : null}
    </div>
  );
}
