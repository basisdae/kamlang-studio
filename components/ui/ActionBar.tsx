import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  innerClassName?: string;
};

export default function ActionBar({ children, innerClassName = "" }: Props) {
  return (
    <div className="kl-action-bar">
      <div className={`kl-action-bar-inner ${innerClassName}`.trim()}>
        {children}
      </div>
    </div>
  );
}
