"use client";

import Link from "next/link";
import { useState } from "react";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import StatCell from "../../../components/ui/StatCell";
import type { SavedRecipe } from "../builder/types";
import {
  formatSavedRecipeStatus,
  normalizeSavedRecipeStatus,
  SAVED_RECIPE_STATUS_TONE,
} from "../builder/status";
import { findMenuLinkedToRecipe } from "../importToMenu";

type Props = {
  recipe: SavedRecipe;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  deleteBlockedMessage?: string | null;
  onClearDeleteBlocked?: () => void;
};

export default function SavedRecipeLibraryCard({
  recipe,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  deleteBlockedMessage,
  onClearDeleteBlocked,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const status = normalizeSavedRecipeStatus(recipe);
  const linked = findMenuLinkedToRecipe(recipe.id);
  const isArchived = status === "archived";

  return (
    <Card className="space-y-3">
      <Link
        href={`/recipes/builder?id=${recipe.id}`}
        className="block kl-pressable"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="kl-type-card-title">{recipe.menuName}</h2>
            {recipe.category ? (
              <p className="kl-type-caption mt-1">{recipe.category}</p>
            ) : null}
          </div>
          <Badge tone={SAVED_RECIPE_STATUS_TONE[status]}>
            {formatSavedRecipeStatus(recipe)}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCell label="ต้นทุน" value={`฿${recipe.totalCost.toFixed(0)}`} />
          <StatCell label="ขาย" value={`฿${recipe.suggestedPrice}`} />
          <StatCell label="กำไร" value={`฿${recipe.profit.toFixed(0)}`} />
        </div>
      </Link>

      {linked ? (
        <Link
          href={`/menus/${linked.id}/edit`}
          className="kl-type-caption font-medium text-kl-brown underline"
        >
          เปิดเมนูที่เชื่อมอยู่
        </Link>
      ) : null}

      {deleteBlockedMessage ? (
        <p className="kl-type-caption text-kl-danger-text" role="alert">
          {deleteBlockedMessage}
          {onClearDeleteBlocked ? (
            <button
              type="button"
              className="ml-2 underline"
              onClick={onClearDeleteBlocked}
            >
              ปิด
            </button>
          ) : null}
        </p>
      ) : null}

      <div className="flex gap-2">
        {confirmDelete ? (
          <>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                onDelete(recipe.id);
                setConfirmDelete(false);
              }}
            >
              ยืนยันลบถาวร
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setConfirmDelete(false)}
            >
              ยกเลิก
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => onDuplicate(recipe.id)}
            >
              คัดลอก
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setMoreOpen((v) => !v)}
              className="text-kl-muted"
            >
              เพิ่มเติม
            </Button>
          </>
        )}
      </div>

      {moreOpen && !confirmDelete ? (
        <div className="space-y-2 border-t border-kl-border pt-2">
          {isArchived ? (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                onRestore(recipe.id);
                setMoreOpen(false);
              }}
            >
              เรียกคืนจากเก็บถาวร
            </Button>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                onArchive(recipe.id);
                setMoreOpen(false);
              }}
            >
              เก็บถาวร
            </Button>
          )}
          <Button
            variant="text"
            fullWidth
            className="text-kl-muted"
            onClick={() => {
              setConfirmDelete(true);
              setMoreOpen(false);
            }}
          >
            ลบถาวร…
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
