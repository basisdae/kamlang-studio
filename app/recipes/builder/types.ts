import type { Ingredient } from "../../ingredients/types";

export type RecipeLine = {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  note?: string;
};

export type DetailDraftState = {
  batchSize: number;
  overrides: Record<number, { quantity: number; unit: string; note?: string }>;
};

export type SavedRecipe = {
  id: string;
  menuName: string;
  category: string;
  ingredients: RecipeLine[];
  totalCost: number;
  suggestedPrice: number;
  profit: number;
  createdAt: string;
  updatedAt: string;
  detailState?: DetailDraftState;
};

export type SaveValidationErrors = {
  menuName?: string;
  ingredients?: string;
};

export type HeaderFormProps = {
  menuName: string;
  category: string;
  menuNameError?: string;
  onMenuNameChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

export type RecipeLinesProps = {
  lines: RecipeLine[];
  ingredientsError?: string;
  onRemoveLine: (index: number) => void;
  onEditLine: (index: number) => void;
  onAddIngredient: () => void;
};

export type IngredientPopupProps = {
  isOpen: boolean;
  isEditingLine: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  filteredIngredients: Ingredient[];
  selectedIngredient: Ingredient | undefined;
  onSelectIngredient: (id: string) => void;
  quantity: string;
  onQuantityChange: (value: string) => void;
  unit: string;
  onUnitChange: (value: string) => void;
  onAdd: () => boolean;
  onCancelSelection: () => void;
};

export type BottomSummaryProps = {
  totalCost: number;
  suggestedPrice: number;
  profit: number;
  profitPercent: number;
  onSave: () => boolean;
};
