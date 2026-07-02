import type { ButtonHTMLAttributes } from "react";
import { getButtonClassName, type ButtonSize, type ButtonVariant } from "./buttonStyles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: ButtonSize;
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  size = "default",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}
