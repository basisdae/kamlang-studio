import ButtonLink from "../../../../components/ui/ButtonLink";
import ActionBar from "../../../../components/ui/ActionBar";

export default function RecipeSampleFooter() {
  return (
    <ActionBar>
      <ButtonLink href="/recipes/builder" fullWidth>
        สร้างสูตรของคุณ
      </ButtonLink>
    </ActionBar>
  );
}
