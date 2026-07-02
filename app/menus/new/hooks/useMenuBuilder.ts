import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateMenuCost } from "../../../lib/menuCostService";
import { getAllPackagingSets } from "../../../packaging/PackagingSetRepository";
import {
  createSavedMenu,
  getSavedMenuById,
  updateSavedMenu,
} from "../../../repositories/SavedMenuRepository";
import { getAllRecipes } from "../../../recipes/RecipeRepository";
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
  sellingPrice: number
): MenuBuilderValidationErrors {
  const errors: MenuBuilderValidationErrors = {};

  if (!name.trim()) {
    errors.name = "กรุณาใส่ชื่อเมนูขาย";
  }

  if (!recipeId) {
    errors.recipeId = "กรุณาเลือกสูตร";
  }

  if (sellingPrice <= 0) {
    errors.sellingPrice = "กรุณาใส่ราคาขายที่มากกว่า 0";
  }

  return errors;
}

export function useMenuBuilder(editingMenuId?: string) {
  const router = useRouter();
  const recipes = useMemo(() => getAllRecipes(), []);
  const packagingSets = useMemo(() => getAllPackagingSets(), []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(!editingMenuId);
  const [menuNotFound, setMenuNotFound] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [packagingSetId, setPackagingSetId] = useState("");
  const [sellingPrice, setSellingPrice] = useState("69");
  const [validationErrors, setValidationErrors] =
    useState<MenuBuilderValidationErrors>({});

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
    setSellingPrice(String(savedMenu.sellingPrice));
    setIsLoaded(true);
  }, [editingMenuId]);

  const isEditMode = editingId !== null;
  const parsedSellingPrice = parseSellingPrice(sellingPrice);

  const preview = useMemo(() => {
    if (!recipeId || parsedSellingPrice <= 0) {
      return null;
    }

    try {
      return calculateMenuCost({
        recipeId,
        packagingSetId: packagingSetId || undefined,
        sellingPrice: parsedSellingPrice,
      });
    } catch {
      return null;
    }
  }, [recipeId, packagingSetId, parsedSellingPrice]);

  function handleSave() {
    const errors = validateForSave(name, recipeId, parsedSellingPrice);
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
        category: category.trim() || "ทั่วไป",
        recipeId,
        packagingSetId: packagingSetId || undefined,
        sellingPrice: parsedSellingPrice,
        updatedAt: now,
      };

      updateSavedMenu(updatedMenu);
      router.push(`/menus/${editingId}`);
      return true;
    }

    const savedMenu: SavedMenu = {
      id: crypto.randomUUID(),
      name: name.trim(),
      category: category.trim() || "ทั่วไป",
      recipeId,
      packagingSetId: packagingSetId || undefined,
      sellingPrice: parsedSellingPrice,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    createSavedMenu(savedMenu);
    router.push("/menus");
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
    handleSave,
  };
}
