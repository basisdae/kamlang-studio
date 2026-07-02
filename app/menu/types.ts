/**
 * Menu domain types.
 *
 * A Menu item is a sellable product — it references a Standard Recipe
 * and carries its own selling price, packaging, and presentation.
 *
 * Recipe = how to cook. Menu = what you sell.
 *
 * @see app/menu/README.md
 */
export type Menu = {
  id: string;
  recipeId: string;
  name: string;
  category: string;
  packagingSetId?: string;
  sellingPrice: number;
  isActive: boolean;
  notes?: string;
};

export type MenuSeed = Menu;
