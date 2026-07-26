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

/**
 * Builder recipe lifecycle (UI Thai via status.ts).
 * Optional on disk for backward compatibility with older localStorage rows.
 */
export type SavedRecipeLifecycleStatus =
  | "draft"
  | "experimenting"
  | "ready"
  | "imported"
  | "archived";

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
  /** Missing on legacy rows → treat as draft */
  status?: SavedRecipeLifecycleStatus;
  /** Linked store-menu draft id when imported (1:1 this queue) */
  linkedMenuId?: string;
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
  /** Returns saved recipe id, or false on validation failure */
  onSave: () => string | false;
  /** After successful save — open “ทำอะไรต่อ?” */
  onSaved?: (recipeId: string) => void;
};
