type Props = {
  mark: string;
  title: string;
  description?: string;
};

/** Compact landing title — no shop/system metadata. */
export default function WorkspaceLandingHeader({
  mark,
  title,
  description,
}: Props) {
  return (
    <header className="space-y-1">
      <p className="kl-type-page-title flex items-center gap-2">
        <span aria-hidden>{mark}</span>
        <span>{title}</span>
      </p>
      {description ? (
        <p className="kl-type-helper">{description}</p>
      ) : null}
    </header>
  );
}
