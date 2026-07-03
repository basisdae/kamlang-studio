import Button from "./Button";

type Props = {
  cancelLabel?: string;
  confirmLabel: string;
  onCancel?: () => void;
  onConfirm: () => void;
  isConfirmDisabled?: boolean;
  isCancelDisabled?: boolean;
  className?: string;
};

export default function SheetActions({
  cancelLabel = "ยกเลิก",
  confirmLabel,
  onCancel,
  onConfirm,
  isConfirmDisabled = false,
  isCancelDisabled = false,
  className = "grid grid-cols-2 gap-3",
}: Props) {
  return (
    <div className={className}>
      <Button
        type="button"
        variant="secondary"
        fullWidth
        onClick={onCancel}
        disabled={isCancelDisabled}
      >
        {cancelLabel}
      </Button>
      <Button
        type="button"
        fullWidth
        onClick={onConfirm}
        disabled={isConfirmDisabled}
      >
        {confirmLabel}
      </Button>
    </div>
  );
}
