import SectionTitle from "../../../../components/ui/SectionTitle";

type Props = {
  notes?: string;
};

export default function MenuNotes({ notes }: Props) {
  if (!notes?.trim()) return null;

  return (
    <section className="space-y-3">
      <SectionTitle module="menus">หมายเหตุ</SectionTitle>

      <div className="kl-section">
        <p className="kl-type-body">{notes}</p>
      </div>
    </section>
  );
}
