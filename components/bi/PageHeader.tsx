type PageHeaderProps = {
  title: string;
  workspace?: string;
  subtitle?: string;
  tagline?: string;
};

export default function PageHeader({
  title,
  workspace,
  subtitle,
  tagline,
}: PageHeaderProps) {
  return (
    <header className="space-y-1.5">
      <p className="kl-type-label">{title}</p>
      {workspace ? (
        <p className="kl-type-caption">Workspace: {workspace}</p>
      ) : null}
      {tagline ? (
        <p className="kl-type-helper italic">{tagline}</p>
      ) : null}
      {subtitle ? (
        <h1 className="kl-type-page-title pt-1">{subtitle}</h1>
      ) : null}
    </header>
  );
}
