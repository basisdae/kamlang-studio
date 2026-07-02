type SectionTitleProps = {
  children: React.ReactNode;
};

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="px-1 text-sm font-bold text-black/45">
      {children}
    </h2>
  );
}