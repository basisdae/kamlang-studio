import type { ModuleAccent } from "../../../components/ui/semanticColors";
import { getModuleSectionClass } from "../../../components/ui/semanticColors";
import HomeActionButton from "./HomeActionButton";

type Props = {
  title: string;
  href: string;
  actionLabel: string;
  module?: ModuleAccent;
};

export default function HomeSectionHeader({
  title,
  href,
  actionLabel,
  module,
}: Props) {
  const moduleClass = module ? getModuleSectionClass(module) : "";

  return (
    <div className="flex items-center justify-between gap-3">
      <h2
        className={`kl-type-section-title kl-section-title min-w-0 truncate ${moduleClass}`}
      >
        {title}
      </h2>
      <HomeActionButton href={href} label={actionLabel} />
    </div>
  );
}
