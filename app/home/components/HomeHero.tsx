import HeroCard from "../../../components/ui/HeroCard";

type Props = {
  label: string;
  title: string;
  subtitle: string;
};

export default function HomeHero({ label, title, subtitle }: Props) {
  return (
    <HeroCard module="home" label={label} title={title} subtitle={subtitle} />
  );
}
