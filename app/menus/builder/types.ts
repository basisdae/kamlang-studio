/**
 * Builder workspace types for saved menu drafts.
 *
 * Not the same as standard Menu items (MenuRepository).
 */
export type MenuSaleStatus = "draft" | "active" | "closed" | "archived";

export type SavedMenu = {
  id: string;
  name: string;
  category: string;
  /** Optional — menu can sell before a recipe exists. */
  recipeId?: string;
  packagingSetId?: string;
  sellingPrice: number;
  /**
   * Legacy flag — kept in sync with saleStatus === "active".
   * Prefer saleStatus for new code.
   */
  isActive: boolean;
  /** Selling lifecycle (separate from cost/recipe readiness). */
  saleStatus?: MenuSaleStatus;
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type MenuBuilderValidationErrors = {
  name?: string;
  recipeId?: string;
  sellingPrice?: string;
  category?: string;
};
