"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "../../../../components/ui/Button";
import ButtonLink from "../../../../components/ui/ButtonLink";
import {
  deleteSavedMenu,
  duplicateSavedMenu,
  restoreSavedMenu,
} from "../../../repositories/SavedMenuRepository";
import { showUndoToast } from "../../../lib/undoToast";

type Props = {
  menuId: string;
  isEditable: boolean;
};

export default function MenuActionBar({ menuId, isEditable }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDuplicate() {
    const copy = duplicateSavedMenu(menuId);
    if (!copy) return;

    router.push(`/menus/${copy.id}`);
  }

  function handleDelete() {
    const deleted = deleteSavedMenu(menuId);
    if (!deleted) return;

    router.push("/menus");

    showUndoToast({
      onUndo: () => {
        restoreSavedMenu(deleted);
        router.push(`/menus/${deleted.id}`);
      },
    });
  }

  if (confirmDelete && isEditable) {
    return (
      <div className="kl-action-bar">
        <div className="kl-action-bar-inner space-y-2">
          <p className="kl-text-caption text-center">ลบเมนูขายนี้ถาวร?</p>
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
        <div className="flex gap-2">
          {isEditable ? (
            <Button variant="secondary" fullWidth onClick={handleDuplicate}>
              ทำสำเนา
            </Button>
          ) : (
            <Button variant="secondary" fullWidth disabled>
              ทำสำเนา
            </Button>
          )}

          {isEditable ? (
            <ButtonLink href={`/menus/${menuId}/edit`} className="flex-1">
              แก้ไขเมนูขาย
            </ButtonLink>
          ) : (
            <Button fullWidth className="flex-1" disabled>
              แก้ไขเมนูขาย
            </Button>
          )}
        </div>

        {isEditable ? (
          <Button
            variant="text"
            fullWidth
            onClick={() => setConfirmDelete(true)}
          >
            ลบเมนูขาย
          </Button>
        ) : (
          <Button variant="text" fullWidth disabled>
            ลบเมนูขาย
          </Button>
        )}
      </div>
    </div>
  );
}
