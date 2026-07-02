import type { ModuleAccent } from "./semanticColors";
import { getModuleHeroClass } from "./semanticColors";

type HeroCardProps = {
  label: string;
  title: string;
  subtitle?: string;
  module?: ModuleAccent;
  children?: React.ReactNode;
};

export default function HeroCard({
  label,
  title,
  subtitle,
  module = "home",
  children,
}: HeroCardProps) {
  return (
    <div className={getModuleHeroClass(module)}>
      <p className="kl-hero-label">{label}</p>
      <h2 className="kl-hero-title">{title}</h2>
      {subtitle ? <p className="kl-hero-subtitle">{subtitle}</p> : null}
      {children ? <div className="kl-hero-body">{children}</div> : null}
    </div>
  );
}
