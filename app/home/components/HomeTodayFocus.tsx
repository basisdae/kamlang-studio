import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import { getModuleHeroClass } from "../../../components/ui/semanticColors";
import { HOME_UI } from "../copy";
import type { HomeNextStep } from "../utils/getHomeNextStep";

type Props = {
  step: HomeNextStep;
};

export default function HomeTodayFocus({ step }: Props) {
  return (
    <Link href={step.href} className="block kl-pressable">
      <div className={getModuleHeroClass("home")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="kl-hero-label">{HOME_UI.focusLabel}</p>
            <h2 className="kl-hero-title">{step.title}</h2>
            {step.hint ? (
              <p className="kl-hero-subtitle">{step.hint}</p>
            ) : null}
          </div>
          <ChevronRight
            className={`${KL_ICON_CLASS} mt-1 shrink-0 text-white/70`}
            strokeWidth={KL_ICON_STROKE}
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
