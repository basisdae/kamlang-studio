import Link from "next/link";
import type { ComponentProps } from "react";
import { getButtonClassName, type ButtonSize, type ButtonVariant } from "./buttonStyles";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: ButtonSize;
};

export default function ButtonLink({
  variant = "primary",
  fullWidth = false,
  size = "default",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
