"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import Button from "../../../../components/ui/Button";
import {
  KL_ICON_CLASS,
  KL_ICON_STROKE,
} from "../../../../components/layout/navConfig";
import {
  findMenuLinkedToRecipe,
  importRecipeToMenuDraft,
} from "../../importToMenu";
import { setSavedRecipeStatus } from "../../../repositories/SavedRecipeRepository";

type Phase = "choose" | "import_success" | "import_exists";

type Props = {
  open: boolean;
  recipeId: string;
  onClose: () => void;
  /** Stay on builder after “ทดลองต่อ” */
  onContinueEditing: () => void;
};

export default function RecipeNextStepSheet({
  open,
  recipeId,
  onClose,
  onContinueEditing,
}: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("choose");
  const [menuId, setMenuId] = useState<string | null>(null);

  if (!open) return null;

  function resetAndClose() {
    setPhase("choose");
    setMenuId(null);
    onClose();
  }

  function handleContinue() {
    setSavedRecipeStatus(recipeId, "experimenting");
    onContinueEditing();
    resetAndClose();
  }

  function handleDraft() {
    setSavedRecipeStatus(recipeId, "draft");
    resetAndClose();
    router.push("/recipes");
  }

  function handleImport() {
    const existing = findMenuLinkedToRecipe(recipeId);
    if (existing) {
      setMenuId(existing.id);
      setPhase("import_exists");
      return;
    }

    const result = importRecipeToMenuDraft(recipeId);
    if (!result.ok) return;

    if (!result.created) {
      setMenuId(result.menuId);
      setPhase("import_exists");
      return;
    }

    setMenuId(result.menuId);
    setPhase("import_success");
  }

  function handleBackToLibrary() {
    resetAndClose();
    router.push("/recipes");
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.35)" }}
      role="dialog"
      aria-modal="true"
      aria-label="ทำอะไรต่อ"
      onClick={resetAndClose}
    >
      <div
        className="relative z-10 mx-4 mb-[calc(var(--kl-nav-bar-height)+var(--kl-nav-float-gap)+env(safe-area-inset-bottom,0px)+0.75rem)] w-full max-w-[var(--bi-app-width)] rounded-[var(--kl-radius)] border border-kl-border bg-kl-card p-4 shadow-[var(--kl-shadow)] sm:mb-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <h2 className="kl-type-card-title">
              {phase === "choose"
                ? "ทำอะไรต่อ?"
                : phase === "import_success"
                  ? "สร้างแบบร่างเมนูแล้ว"
                  : "สูตรนี้มีเมนูที่เชื่อมอยู่แล้ว"}
            </h2>
            <p className="kl-type-helper mt-1">
              {phase === "choose"
                ? "สูตรถูกบันทึกแล้ว — เลือกขั้นตอนถัดไป"
                : phase === "import_success"
                  ? "ยังไม่เปิดขาย — กรอกราคาและรายละเอียดขายในแบบร่างเมนู"
                  : "ไม่สร้างเมนูซ้ำ — เปิดแบบร่างเดิมได้"}
            </p>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-kl-muted"
            aria-label="ปิด"
          >
            <X className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
          </button>
        </div>

        {phase === "choose" ? (
          <div className="space-y-2">
            <Button fullWidth onClick={handleImport}>
              นำเข้าเมนูร้าน
            </Button>
            <Button variant="secondary" fullWidth onClick={handleContinue}>
              ทดลองและแก้ไขต่อ
            </Button>
            <Button variant="secondary" fullWidth onClick={handleDraft}>
              เก็บเป็นแบบร่าง
            </Button>
            <Button variant="text" fullWidth onClick={handleBackToLibrary}>
              ปิดแล้วกลับไปคลังสูตร
            </Button>
          </div>
        ) : null}

        {phase === "import_success" || phase === "import_exists" ? (
          <div className="space-y-2">
            {menuId ? (
              <Button
                fullWidth
                onClick={() => {
                  resetAndClose();
                  router.push(`/menus/${menuId}/edit`);
                }}
              >
                {phase === "import_exists"
                  ? "เปิดแบบร่างเมนูเดิม"
                  : "ไปแก้ไขแบบร่างเมนู"}
              </Button>
            ) : null}
            <Button
              variant="secondary"
              fullWidth
              onClick={handleBackToLibrary}
            >
              กลับไปคลังสูตร
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
