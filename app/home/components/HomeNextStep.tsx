import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../../components/layout/navConfig";
import { HOME_UI } from "../copy";
import type { HomeNextStep } from "../utils/getHomeNextStep";

type Props = {
  step: HomeNextStep;
};

export default function HomeNextStep({ step }: Props) {
  return (
    <Link href={step.href} className="block kl-pressable">
      <div className="kl-next-step">
        <div className="min-w-0 flex-1">
          <p className="kl-type-label">{HOME_UI.nextStep}</p>
          <p className="kl-type-card-title mt-1">{step.title}</p>
          <p className="kl-type-helper mt-1.5">{step.hint}</p>
        </div>
        <ChevronRight
          className={`${KL_ICON_CLASS} mt-1 text-kl-muted`}
          strokeWidth={KL_ICON_STROKE}
        />
      </div>
    </Link>
  );
}
