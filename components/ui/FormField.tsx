import type { ReactNode } from "react";

type Props = {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  error,
  children,
  className = "",
}: Props) {
  return (
    <div className={className}>
      <label className="kl-type-label">{label}</label>
      {children}
      {error ? (
        <div className="kl-type-caption mt-1 text-kl-danger-text">{error}</div>
      ) : null}
    </div>
  );
}
