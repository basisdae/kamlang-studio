"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../components/layout/navConfig";
import Button from "../../../components/ui/Button";
import ActionBar from "../../../components/ui/ActionBar";
import ButtonLink from "../../../components/ui/ButtonLink";
import IconButton from "../../../components/ui/IconButton";
import {
  deleteProductionPlanForDate,
  restoreProductionPlanSnapshot,
} from "../../repositories/SavedProductionRepository";
import { showUndoToast } from "../../lib/undoToast";

type Props = {
  editHref: string;
  planDate: string;
  canDelete: boolean;
  onDeleted?: () => void;
};

export default function ProductionHeroActions({
  editHref,
  planDate,
  canDelete,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isMenuOpen]);

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

  function openDeleteConfirm() {
    setIsMenuOpen(false);
    setConfirmDelete(true);
  }

  if (confirmDelete && canDelete) {
    return (
      <ActionBar innerClassName="space-y-2">
          <p className="kl-text-caption text-center">ลบแผนวันนี้ถาวร?</p>
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
      </ActionBar>
    );
  }

  return (
    <div className="kl-hero-actions">
      <ButtonLink href={editHref} className="min-w-0 flex-1">
        แก้ไขแผนวันนี้
      </ButtonLink>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0"
        onClick={handleDuplicate}
      >
        คัดลอก
      </Button>

      <div ref={menuRef} className="relative shrink-0">
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          aria-label="ตัวเลือกเพิ่มเติม"
          aria-expanded={isMenuOpen}
          className="!border-white/25 !bg-white/10 !text-white"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <MoreHorizontal className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </IconButton>

        {isMenuOpen ? (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[10.5rem] kl-dropdown-panel">
            <button
              type="button"
              className="kl-nav-more-row w-full text-kl-danger-text disabled:opacity-40"
              disabled={!canDelete}
              onClick={openDeleteConfirm}
            >
              ลบแผน
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
