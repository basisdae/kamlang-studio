import { useEffect, useMemo, useState } from "react";
import { getAllIngredients } from "../../../ingredients/IngredientRepository";
import {
  defaultUnitForIngredient,
  filterIngredients,
} from "../../../ingredients/utils";
import {
  createSavedRecipe,
  getSavedRecipeById,
  updateSavedRecipe,
} from "../../../repositories/SavedRecipeRepository";
import type { RecipeLine, SaveValidationErrors } from "../types";
import {
  calcLineCost,
  calcProfit,
  calcProfitPercent,
  calcSuggestedPrice,
  calcTotalCost,
  hasValidationErrors,
  validateRecipeForSave,
} from "../utils";

function prepareLinesForSave(lines: RecipeLine[]) {
  const ingredients = getAllIngredients();

  return lines.map((line) => {
    const ingredient = ingredients.find((item) => item.id === line.ingredientId);
    const cost = ingredient
      ? calcLineCost(ingredient, line.quantity, line.unit)
      : line.cost;

    return {
      ...line,
      cost,
    };
  });
}

export function useRecipeBuilder() {
  const ingredients = useMemo(() => getAllIngredients(), []);
  const [menuName, setMenuName] = useState("");
  const [category, setCategory] = useState("");
  const [isIngredientPopupOpen, setIsIngredientPopupOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | null
  >(null);
  const [quantity, setQuantity] = useState("80");
  const [unit, setUnit] = useState("g");
  const [lines, setLines] = useState<RecipeLine[]>([]);
  const [validationErrors, setValidationErrors] =
    useState<SaveValidationErrors>({});
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    const recipe = getSavedRecipeById(id);
    if (!recipe) return;

    setEditingRecipeId(recipe.id);
    setMenuName(recipe.menuName);
    setCategory(recipe.category);
    setLines(recipe.ingredients);
  }, []);

  const filteredIngredients = useMemo(
    () => filterIngredients(ingredients, search),
    [ingredients, search]
  );

  const selectedIngredient = ingredients.find(
    (item) => item.id === selectedIngredientId
  );

  const totalCost = useMemo(() => calcTotalCost(lines), [lines]);
  const suggestedPrice = useMemo(
    () => calcSuggestedPrice(totalCost),
    [totalCost]
  );
  const profit = useMemo(
    () => calcProfit(totalCost, suggestedPrice),
    [totalCost, suggestedPrice]
  );
  const profitPercent = useMemo(
    () => calcProfitPercent(totalCost, suggestedPrice),
    [totalCost, suggestedPrice]
  );

  useEffect(() => {
    if (lines.length > 0 && validationErrors.ingredients) {
      setValidationErrors((current) => ({
        ...current,
        ingredients: undefined,
      }));
    }
  }, [lines.length, validationErrors.ingredients]);

  function handleMenuNameChange(value: string) {
    setMenuName(value);

    if (validationErrors.menuName) {
      setValidationErrors((current) => ({
        ...current,
        menuName: undefined,
      }));
    }
  }

  function openIngredientPopup() {
    setEditingLineIndex(null);
    setIsIngredientPopupOpen(true);
  }

  function closeIngredientPopup() {
    setIsIngredientPopupOpen(false);
    setSelectedIngredientId(null);
    setEditingLineIndex(null);
    setQuantity("80");
    setUnit("g");
  }

  function selectIngredient(id: string) {
    const ingredient = ingredients.find((item) => item.id === id);
    if (!ingredient) return;

    setSelectedIngredientId(id);
    setUnit(defaultUnitForIngredient(ingredient));
  }

  function editLine(index: number) {
    const line = lines[index];
    if (!line) return;

    setEditingLineIndex(index);
    setSelectedIngredientId(line.ingredientId);
    setQuantity(String(line.quantity));
    setUnit(line.unit);
    setIsIngredientPopupOpen(true);
  }

  function cancelIngredientSelection() {
    if (editingLineIndex !== null) {
      closeIngredientPopup();
      return;
    }

    setSelectedIngredientId(null);
  }

  function addIngredient(): boolean {
    const qty = Number(quantity);
    if (!qty || qty <= 0) return false;

    if (editingLineIndex !== null) {
      const line = lines[editingLineIndex];
      const ingredient = ingredients.find((item) => item.id === line.ingredientId);
      if (!ingredient) return false;

      const cost = calcLineCost(ingredient, qty, unit);

      setLines((current) =>
        current.map((item, index) =>
          index === editingLineIndex
            ? {
                ...item,
                quantity: qty,
                unit,
                cost,
              }
            : item
        )
      );

      closeIngredientPopup();
      return true;
    }

    if (!selectedIngredient) return false;

    const cost = calcLineCost(selectedIngredient, qty, unit);

    setLines((current) => [
      ...current,
      {
        ingredientId: selectedIngredient.id,
        name: selectedIngredient.name,
        quantity: qty,
        unit,
        cost,
      },
    ]);

    setSelectedIngredientId(null);
    return true;
  }

  function removeLine(index: number) {
    setLines((current) => current.filter((_, i) => i !== index));
  }

  function handleSave(): boolean {
    const errors = validateRecipeForSave(menuName, lines);

    if (hasValidationErrors(errors)) {
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});

    const now = new Date().toISOString();
    const ingredientsToSave = prepareLinesForSave(lines);
    const savedTotalCost = calcTotalCost(ingredientsToSave);
    const savedSuggestedPrice = calcSuggestedPrice(savedTotalCost);
    const savedProfit = calcProfit(savedTotalCost, savedSuggestedPrice);

    if (editingRecipeId) {
      const existing = getSavedRecipeById(editingRecipeId);
      if (!existing) return false;

      updateSavedRecipe({
        id: editingRecipeId,
        menuName: menuName.trim(),
        category: category.trim(),
        ingredients: ingredientsToSave,
        totalCost: savedTotalCost,
        suggestedPrice: savedSuggestedPrice,
        profit: savedProfit,
        createdAt: existing.createdAt,
        updatedAt: now,
      });

      return true;
    }

    const newId = crypto.randomUUID();

    createSavedRecipe({
      id: newId,
      menuName: menuName.trim(),
      category: category.trim(),
      ingredients: ingredientsToSave,
      totalCost: savedTotalCost,
      suggestedPrice: savedSuggestedPrice,
      profit: savedProfit,
      createdAt: now,
      updatedAt: now,
    });

    setEditingRecipeId(newId);

    const url = new URL(window.location.href);
    url.searchParams.set("id", newId);
    window.history.replaceState(null, "", url.toString());

    return true;
  }

  return {
    menuName,
    category,
    validationErrors,
    handleMenuNameChange,
    setCategory,
    lines,
    removeLine,
    editLine,
    openIngredientPopup,
    isIngredientPopupOpen,
    closeIngredientPopup,
    search,
    setSearch,
    filteredIngredients,
    selectedIngredient,
    selectIngredient,
    quantity,
    setQuantity,
    unit,
    setUnit,
    addIngredient,
    cancelIngredientSelection,
    totalCost,
    suggestedPrice,
    profit,
    profitPercent,
    handleSave,
    editingLineIndex,
    editingRecipeId,
  };
}
