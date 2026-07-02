import Link from "next/link";
import type { ComponentProps } from "react";
import {
  getIconButtonClassName,
  type ButtonSize,
  type IconButtonVariant,
} from "./buttonStyles";

type IconButtonLinkProps = ComponentProps<typeof Link> & {
  size?: ButtonSize;
  variant?: IconButtonVariant;
};

export default function IconButtonLink({
  size = "default",
  variant = "soft",
  className = "",
  ...props
}: IconButtonLinkProps) {
  return (
    <Link
      className={getIconButtonClassName({ variant, size, className })}
      {...props}
    />
  );
}
