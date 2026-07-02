/**
 * Builder workspace types for saved menu drafts.
 *
 * Not the same as standard Menu items (MenuRepository).
 */
export type SavedMenu = {
  id: string;
  name: string;
  category: string;
  recipeId: string;
  packagingSetId?: string;
  sellingPrice: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MenuBuilderValidationErrors = {
  name?: string;
  recipeId?: string;
  sellingPrice?: string;
};
