import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import ButtonLink from "../../../components/ui/ButtonLink";

type Props = {
  href: string;
  label: string;
};

export default function HomeActionButton({ href, label }: Props) {
  return (
    <ButtonLink href={href} variant="secondary" size="sm" className="shrink-0">
      {label}
      <ChevronRight
        className={KL_ICON_CLASS}
        strokeWidth={KL_ICON_STROKE}
        aria-hidden
      />
    </ButtonLink>
  );
}
