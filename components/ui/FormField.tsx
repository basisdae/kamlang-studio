import type { ReactNode } from "react";

type Props = {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
};

export default function FormField({
  label,
  error,
  children,
  className = "",
  htmlFor,
}: Props) {
  return (
    <div className={className}>
      <label className="kl-type-label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <div className="kl-type-caption mt-1 text-kl-danger-text" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
