"use client";

import Button from "../ui/Button";
import Dialog from "../ui/Dialog";

type Props = {
  open: boolean;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onOpen: () => void;
  triggerLabel?: string;
};

/**
 * Delete-safety confirm before archive — owner language, no schema jargon.
 */
export default function ArchiveConfirm({
  open,
  saving = false,
  onCancel,
  onConfirm,
  onOpen,
  triggerLabel = "Archive",
}: Props) {
  if (open) {
    return (
      <Dialog
        open={open}
        onClose={onCancel}
        title="Archive รายการนี้?"
        role="alertdialog"
      >
        <p className="kl-type-body">Archive รายการนี้?</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            fullWidth
            disabled={saving}
            onClick={onCancel}
          >
            ยกเลิก
          </Button>
          <Button fullWidth disabled={saving} onClick={onConfirm}>
            {saving ? "กำลังบันทึก..." : "Archive"}
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Button
      variant="secondary"
      fullWidth
      className="min-h-[2.75rem]"
      disabled={saving}
      onClick={onOpen}
    >
      {triggerLabel}
    </Button>
  );
}
