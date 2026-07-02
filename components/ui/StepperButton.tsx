import { Minus, Plus } from "lucide-react";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../layout/navConfig";
import IconButton from "./IconButton";

type Props = {
  kind: "increment" | "decrement";
  onClick: () => void;
  disabled?: boolean;
  "aria-label": string;
};

export default function StepperButton({
  kind,
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
}: Props) {
  const Icon = kind === "increment" ? Plus : Minus;

  return (
    <IconButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <Icon className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
    </IconButton>
  );
}
