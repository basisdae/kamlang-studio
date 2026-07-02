import type { ButtonHTMLAttributes } from "react";
import {
  getIconButtonClassName,
  type ButtonSize,
  type IconButtonVariant,
} from "./buttonStyles";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: IconButtonVariant;
};

export default function IconButton({
  size = "default",
  variant = "soft",
  className = "",
  type = "button",
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={getIconButtonClassName({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
}
