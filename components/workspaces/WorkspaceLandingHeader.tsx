type Props = {
  title: string;
  description?: string;
};

/**
 * Landing / page content header — job title only (Context vs Content).
 * Workspace name lives in WorkspaceSwitcher; never repeat it here.
 */
export default function WorkspaceLandingHeader({
  title,
  description,
}: Props) {
  return (
    <header className="space-y-1">
      <h1 className="kl-type-page-title">{title}</h1>
      {description ? (
        <p className="kl-type-helper">{description}</p>
      ) : null}
    </header>
  );
}
