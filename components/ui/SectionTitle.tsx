import type { ModuleAccent } from "./semanticColors";
import { getModuleSectionClass } from "./semanticColors";

type SectionTitleProps = {
  children: React.ReactNode;
  module?: ModuleAccent;
};

export default function SectionTitle({ children, module }: SectionTitleProps) {
  const moduleClass = module ? getModuleSectionClass(module) : "";

  return (
    <h2 className={`kl-type-section-title kl-section-title ${moduleClass}`}>
      {children}
    </h2>
  );
}
