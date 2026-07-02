import SectionTitle from "../../../../components/ui/SectionTitle";

type Props = {
  notes: string;
};

export default function RecipeNotes({ notes }: Props) {
  if (!notes.trim()) return null;

  return (
    <section className="space-y-3">
      <SectionTitle module="recipes">หมายเหตุ</SectionTitle>

      <div className="kl-section">
        <p className="kl-text-body leading-relaxed">{notes}</p>
      </div>
    </section>
  );
}
