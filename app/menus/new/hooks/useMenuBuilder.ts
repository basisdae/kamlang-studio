import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createSavedMenu,
  getSavedMenuById,
  updateSavedMenu,
} from "../../../repositories/SavedMenuRepository";
import {
  getSavedRecipeById,
  updateSavedRecipe,
} from "../../../repositories/SavedRecipeRepository";
import { getAllPackagingSets } from "../../../packaging/PackagingSetRepository";
import { getAllRecipesForPicker } from "../../../recipes/recipeAccess";
import type {
  MenuBuilderValidationErrors,
  MenuSaleStatus,
  SavedMenu,
} from "../../builder/types";
import { resolveMenuCost } from "../../saleStatus";

function parseSellingPrice(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function validateForSave(
  name: string,
  category: string,
  sellingPrice: number,
  saleStatus: MenuSaleStatus
): MenuBuilderValidationErrors {
  const errors: MenuBuilderValidationErrors = {};

  if (!name.trim()) {
    errors.name = "กรุณาใส่ชื่อเมนูขาย";
  }

  if (!category.trim()) {
    errors.category = "กรุณาใส่หมวดหมู่";
  }

  if (saleStatus === "active" && sellingPrice <= 0) {
    errors.sellingPrice = "เปิดขายได้เมื่อใส่ราคาขายที่มากกว่า 0";
  }

  return errors;
}

function syncRecipeLink(recipeId: string, menuId: string, now: string) {
  const savedRecipe = getSavedRecipeById(recipeId);
  if (!savedRecipe) return;
  if (savedRecipe.linkedMenuId === menuId && savedRecipe.status === "imported") {
    return;
  }
  updateSavedRecipe(
    {
      ...savedRecipe,
      linkedMenuId: menuId,
      status: "imported",
      updatedAt: now,
    },
    { recordVersion: false }
  );
}

export type RecipeLinkMode = "none" | "link" | "create";

export function useMenuBuilder(editingMenuId?: string) {
  const router = useRouter();
  const recipes = useMemo(() => getAllRecipesForPicker(), []);
  const packagingSets = useMemo(() => getAllPackagingSets(), []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(!editingMenuId);
  const [menuNotFound, setMenuNotFound] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [recipeMode, setRecipeModeState] = useState<RecipeLinkMode>("none");
  const [packagingSetId, setPackagingSetId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [saleStatus, setSaleStatus] = useState<MenuSaleStatus>("draft");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<MenuBuilderValidationErrors>({});

  useEffect(() => {
    if (editingMenuId) return;

    queueMicrotask(() => {
      const params = new URLSearchParams(window.location.search);
      const fromRecipe = params.get("recipeId");
      if (!fromRecipe) return;

      const match = recipes.find((recipe) => recipe.id === fromRecipe);
      if (!match) return;

      setRecipeId(match.id);
      setRecipeModeState("link");
      setName((current) => current.trim() || match.name);
      setSaleStatus("draft");
    });
  }, [editingMenuId, recipes]);

  useEffect(() => {
    if (!editingMenuId) return;

    queueMicrotask(() => {
      const savedMenu = getSavedMenuById(editingMenuId);
      if (!savedMenu) {
        setMenuNotFound(true);
        setIsLoaded(true);
        return;
      }

      setEditingId(savedMenu.id);
      setName(savedMenu.name);
      setCategory(savedMenu.category);
      setRecipeId(savedMenu.recipeId ?? "");
      setRecipeModeState(savedMenu.recipeId ? "link" : "none");
      setPackagingSetId(savedMenu.packagingSetId ?? "");
      setSellingPrice(
        savedMenu.sellingPrice > 0 ? String(savedMenu.sellingPrice) : ""
      );
      setSaleStatus(
        savedMenu.saleStatus ?? (savedMenu.isActive ? "active" : "draft")
      );
      setNotes(savedMenu.notes ?? "");
      setIsLoaded(true);
    });
  }, [editingMenuId]);

  const isEditMode = editingId !== null;
  const parsedSellingPrice = parseSellingPrice(sellingPrice);
  const effectiveRecipeId =
    recipeMode === "link" && recipeId.trim() ? recipeId.trim() : undefined;

  const preview = useMemo(() => {
    const { status, cost } = resolveMenuCost({
      recipeId: effectiveRecipeId,
      packagingSetId: packagingSetId || undefined,
      sellingPrice: parsedSellingPrice,
    });
    if (status !== "calculated") return null;
    return cost;
  }, [effectiveRecipeId, packagingSetId, parsedSellingPrice]);

  const costNotice =
    recipeMode === "none" || !effectiveRecipeId
      ? "ยังไม่ได้คำนวณต้นทุน สามารถกลับมาเพิ่มสูตรภายหลังได้"
      : null;

  function setRecipeMode(mode: RecipeLinkMode) {
    setRecipeModeState(mode);
    if (mode === "none") {
      setRecipeId("");
    }
    if (mode === "create" && editingId) {
      const params = new URLSearchParams({
        linkMenuId: editingId,
        menuName: name.trim() || "เมนูใหม่",
      });
      router.push(`/recipes/builder?${params.toString()}`);
    }
  }

  function handleSave() {
    if (saving) return false;

    const errors = validateForSave(
      name,
      category,
      parsedSellingPrice,
      saleStatus
    );
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const nextRecipeId =
        recipeMode === "link" && recipeId.trim() ? recipeId.trim() : undefined;

      if (editingId) {
        const existing = getSavedMenuById(editingId);
        if (!existing) return false;

        const updatedMenu: SavedMenu = {
          ...existing,
          name: name.trim(),
          category: category.trim(),
          recipeId: nextRecipeId,
          packagingSetId: packagingSetId || undefined,
          sellingPrice: parsedSellingPrice,
          saleStatus,
          isActive: saleStatus === "active",
          notes: notes.trim() || undefined,
          updatedAt: now,
        };

        updateSavedMenu(updatedMenu);
        if (nextRecipeId) syncRecipeLink(nextRecipeId, editingId, now);
        router.push(`/menus/${editingId}`);
        return true;
      }

      const savedMenu: SavedMenu = {
        id: crypto.randomUUID(),
        name: name.trim(),
        category: category.trim(),
        recipeId: nextRecipeId,
        packagingSetId: packagingSetId || undefined,
        sellingPrice: parsedSellingPrice,
        saleStatus,
        isActive: saleStatus === "active",
        notes: notes.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      createSavedMenu(savedMenu);
      if (nextRecipeId) syncRecipeLink(nextRecipeId, savedMenu.id, now);

      if (recipeMode === "create") {
        const params = new URLSearchParams({
          linkMenuId: savedMenu.id,
          menuName: savedMenu.name,
        });
        router.push(`/recipes/builder?${params.toString()}`);
        return true;
      }

      router.push(
        saleStatus === "active" ? "/menus" : `/menus/${savedMenu.id}`
      );
      return true;
    } finally {
      setSaving(false);
    }
  }

  return {
    recipes,
    packagingSets,
    name,
    category,
    recipeId,
    recipeMode,
    packagingSetId,
    sellingPrice,
    saleStatus,
    notes,
    validationErrors,
    preview,
    costNotice,
    isEditMode,
    isLoaded,
    menuNotFound,
    saving,
    isActive: saleStatus === "active",
    setName,
    setCategory,
    setRecipeId,
    setRecipeMode,
    setPackagingSetId,
    setSellingPrice,
    setSaleStatus,
    setIsActive: (active: boolean) =>
      setSaleStatus(active ? "active" : "draft"),
    setNotes,
    handleSave,
  };
}
