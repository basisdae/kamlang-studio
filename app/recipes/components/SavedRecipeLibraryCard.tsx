"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import StatCell from "../../../components/ui/StatCell";
import type { SavedRecipe } from "../builder/types";

type Props = {
  recipe: SavedRecipe;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function SavedRecipeLibraryCard({
  recipe,
  onDuplicate,
  onDelete,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="space-y-3">
      <Link
        href={`/recipes/builder?id=${recipe.id}`}
        className="block kl-pressable"
      >
        <div>
          <h2 className="kl-type-card-title">{recipe.menuName}</h2>
          {recipe.category ? (
            <p className="kl-type-caption mt-1">{recipe.category}</p>
          ) : null}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatCell label="ต้นทุน" value={`฿${recipe.totalCost.toFixed(0)}`} />
          <StatCell label="ขาย" value={`฿${recipe.suggestedPrice}`} />
          <StatCell label="กำไร" value={`฿${recipe.profit.toFixed(0)}`} />
        </div>
      </Link>

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
              ยืนยันลบ
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
              onClick={() => setConfirmDelete(true)}
              className="text-kl-muted"
            >
              ลบ
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
