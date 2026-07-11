import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Card from "../ui/Card";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";

type NextStepCardProps = {
  title?: string;
  message: string;
  href: string;
  actionLabel: string;
};

/** Primary next-action card — same position/flow on every breakpoint */
export default function NextStepCard({
  title = "สิ่งที่ควรทำต่อ",
  message,
  href,
  actionLabel,
}: NextStepCardProps) {
  return (
    <Card className="space-y-3 !border-[var(--bi-lemon)] !bg-[rgb(231_246_91/0.28)] !p-4">
      <p className="kl-type-label text-[var(--bi-text-primary)]">{title}</p>
      <p className="kl-type-card-title leading-snug">{message}</p>
      <Link
        href={href}
        className="kl-btn kl-btn-primary flex w-full min-h-[2.75rem] items-center justify-center gap-2 kl-pressable"
      >
        <span>{actionLabel}</span>
        <ArrowRight className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
      </Link>
    </Card>
  );
}
