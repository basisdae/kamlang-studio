export type ButtonVariant = "primary" | "secondary" | "danger" | "text";
export type ButtonSize = "default" | "sm";
export type IconButtonVariant = "soft" | "ghost";

const variantClass: Record<ButtonVariant, string> = {
  primary: "kl-btn kl-btn-primary",
  secondary: "kl-btn kl-btn-secondary",
  danger: "kl-btn kl-btn-danger",
  text: "kl-btn kl-btn-text",
};

const iconVariantClass: Record<IconButtonVariant, string> = {
  soft: "kl-icon-button kl-icon-button--soft",
  ghost: "kl-icon-button kl-icon-button--ghost",
};

export function getButtonClassName({
  variant = "primary",
  size = "default",
  fullWidth = false,
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}) {
  return [
    variantClass[variant],
    size === "sm" ? "kl-btn-sm" : "",
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function getIconButtonClassName({
  variant = "soft",
  size = "default",
  className = "",
}: {
  variant?: IconButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return [
    iconVariantClass[variant],
    size === "sm" ? "kl-icon-button-sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
