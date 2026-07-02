"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import {
  deleteProductionPlanForDate,
  restoreProductionPlanSnapshot,
} from "../../repositories/SavedProductionRepository";
import { showUndoToast } from "../../lib/undoToast";

type Props = {
  planDate: string;
  canDelete: boolean;
  onDeleted?: () => void;
};

export default function ProductionActionBar({
  planDate,
  canDelete,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDuplicate() {
    router.push(`/production/edit?duplicateFrom=${planDate}`);
  }

  function handleDelete() {
    const snapshot = deleteProductionPlanForDate(planDate);
    if (!snapshot) return;

    onDeleted?.();
    router.push("/production");

    showUndoToast({
      onUndo: () => {
        restoreProductionPlanSnapshot(snapshot);
        onDeleted?.();
        router.push("/production");
      },
    });
  }

  if (confirmDelete && canDelete) {
    return (
      <div className="kl-action-bar">
        <div className="kl-action-bar-inner space-y-2">
          <p className="kl-text-caption text-center">ลบแผนผลิตวันนี้ถาวร?</p>
          <div className="flex gap-2">
            <Button variant="danger" fullWidth onClick={handleDelete}>
              ยืนยันลบ
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setConfirmDelete(false)}
            >
              ยกเลิก
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kl-action-bar">
      <div className="kl-action-bar-inner space-y-2">
        <Button variant="secondary" fullWidth onClick={handleDuplicate}>
          ทำสำเนา
        </Button>

        {canDelete ? (
          <Button
            variant="text"
            fullWidth
            onClick={() => setConfirmDelete(true)}
          >
            ลบแผน
          </Button>
        ) : (
          <Button variant="text" fullWidth disabled>
            ลบแผน
          </Button>
        )}
      </div>
    </div>
  );
}
