import { HOME_UI } from "../copy";import ButtonLink from "../../../components/ui/ButtonLink";

export default function HomeSetupBanner() {
  return (
    <div className="kl-section space-y-3 !bg-kl-surface py-3">
      <div>
        <div className="kl-type-card-title">{HOME_UI.setup.title}</div>
        <p className="kl-type-helper mt-1">{HOME_UI.setup.hint}</p>
      </div>

      <ButtonLink href="/setup" fullWidth>
        {HOME_UI.setup.action}
      </ButtonLink>
    </div>
  );
}
