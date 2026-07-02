type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const toneClass: Record<BadgeTone, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-stone-100 text-stone-600",
};

export default function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${toneClass[tone]}`}>
      {children}
    </span>
  );
}