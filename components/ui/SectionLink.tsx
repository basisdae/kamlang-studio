import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../layout/navConfig";
import { getModuleIconWellClass } from "./semanticColors";
import type { ModuleAccent } from "./semanticColors";

type CreateProps = {
  variant: "create";
  href: string;
  title: string;
  module: ModuleAccent;
};

type NavProps = {
  variant: "nav";
  href: string;
  title: string;
  label?: string;
};

type Props = CreateProps | NavProps;

export default function SectionLink(props: Props) {
  if (props.variant === "create") {
    return (
      <Link
        href={props.href}
        className="kl-section flex min-h-[3.25rem] items-center gap-3 kl-pressable"
      >
        <div
          className={`${getModuleIconWellClass(props.module)} pointer-events-none`}
          aria-hidden
        >
          <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </div>
        <div className="kl-type-card-title">{props.title}</div>
      </Link>
    );
  }

  return (
    <Link
      href={props.href}
      className="kl-section flex min-h-[3.25rem] items-center justify-between gap-3 kl-pressable"
    >
      <div>
        {props.label ? (
          <div className="kl-type-label">{props.label}</div>
        ) : null}
        <div className={`kl-type-card-title${props.label ? " mt-1" : ""}`}>
          {props.title}
        </div>
      </div>
      <ChevronRight
        className={`${KL_ICON_CLASS} shrink-0 text-kl-muted`}
        strokeWidth={KL_ICON_STROKE}
      />
    </Link>
  );
}
