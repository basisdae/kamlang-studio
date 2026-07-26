import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateMenuCost } from "../../../lib/menuCostService";
import { getAllPackagingSets } from "../../../packaging/PackagingSetRepository";
import {
  createSavedMenu,
  getSavedMenuById,
  updateSavedMenu,
} from "../../../repositories/SavedMenuRepository";
import { getAllRecipesForPicker } from "../../../recipes/recipeAccess";
import type {
  MenuBuilderValidationErrors,
  SavedMenu,
} from "../../builder/types";

function parseSellingPrice(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function validateForSave(
  name: string,
  recipeId: string,
  sellingPrice: number,
  isActive: boolean
): MenuBuilderValidationErrors {
  const errors: MenuBuilderValidationErrors = {};

  if (!name.trim()) {
    errors.name = "กรุณาใส่ชื่อเมนูขาย";
  }

  if (!recipeId) {
    errors.recipeId = "กรุณาเลือกสูตร";
  }

  if (isActive && sellingPrice <= 0) {
    errors.sellingPrice = "เปิดขายได้เมื่อใส่ราคาขายที่มากกว่า 0";
  }

  return errors;
}

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
  const [packagingSetId, setPackagingSetId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [notes, setNotes] = useState("");
  const [validationErrors, setValidationErrors] =
    useState<MenuBuilderValidationErrors>({});

  useEffect(() => {
    if (editingMenuId) return;

    const params = new URLSearchParams(window.location.search);
    const fromRecipe = params.get("recipeId");
    if (!fromRecipe) return;

    const match = recipes.find((recipe) => recipe.id === fromRecipe);
    if (!match) return;

    setRecipeId(match.id);
    setName((current) => current.trim() || match.name);
  }, [editingMenuId, recipes]);

  useEffect(() => {
    if (!editingMenuId) return;

    const savedMenu = getSavedMenuById(editingMenuId);
    if (!savedMenu) {
      setMenuNotFound(true);
      setIsLoaded(true);
      return;
    }

    setEditingId(savedMenu.id);
    setName(savedMenu.name);
    setCategory(savedMenu.category);
    setRecipeId(savedMenu.recipeId);
    setPackagingSetId(savedMenu.packagingSetId ?? "");
    setSellingPrice(
      savedMenu.sellingPrice > 0 ? String(savedMenu.sellingPrice) : ""
    );
    setIsActive(savedMenu.isActive);
    setNotes(savedMenu.notes ?? "");
    setIsLoaded(true);
  }, [editingMenuId]);

  const isEditMode = editingId !== null;
  const parsedSellingPrice = parseSellingPrice(sellingPrice);

  const preview = useMemo(() => {
    if (!recipeId) return null;

    try {
      const priceForCalc = parsedSellingPrice > 0 ? parsedSellingPrice : 0.01;
      const result = calculateMenuCost({
        recipeId,
        packagingSetId: packagingSetId || undefined,
        sellingPrice: priceForCalc,
      });
      if (parsedSellingPrice <= 0) {
        return {
          ...result,
          sellingPrice: 0,
          grossProfit: 0 - result.totalCost,
          grossProfitPercent: 0,
        };
      }
      return result;
    } catch {
      return null;
    }
  }, [recipeId, packagingSetId, parsedSellingPrice]);

  function handleSave() {
    const errors = validateForSave(
      name,
      recipeId,
      parsedSellingPrice,
      isActive
    );
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    const now = new Date().toISOString();

    if (editingId) {
      const existing = getSavedMenuById(editingId);
      if (!existing) return false;

      const updatedMenu: SavedMenu = {
        ...existing,
        name: name.trim(),
        category: category.trim(),
        recipeId,
        packagingSetId: packagingSetId || undefined,
        sellingPrice: parsedSellingPrice,
        isActive,
        notes: notes.trim() || undefined,
        updatedAt: now,
      };

      updateSavedMenu(updatedMenu);
      router.push(`/menus/${editingId}`);
      return true;
    }

    const savedMenu: SavedMenu = {
      id: crypto.randomUUID(),
      name: name.trim(),
      category: category.trim(),
      recipeId,
      packagingSetId: packagingSetId || undefined,
      sellingPrice: parsedSellingPrice,
      isActive,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    createSavedMenu(savedMenu);
    router.push(isActive ? "/menus" : `/menus/${savedMenu.id}`);
    return true;
  }

  return {
    recipes,
    packagingSets,
    name,
    category,
    recipeId,
    packagingSetId,
    sellingPrice,
    isActive,
    notes,
    validationErrors,
    preview,
    isEditMode,
    isLoaded,
    menuNotFound,
    setName,
    setCategory,
    setRecipeId,
    setPackagingSetId,
    setSellingPrice,
    setIsActive,
    setNotes,
    handleSave,
  };
}
