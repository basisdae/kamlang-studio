import type { Recipe } from "./types";

export function filterRecipes(recipes: Recipe[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return recipes;

  return recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(query) ||
      recipe.category.toLowerCase().includes(query)
  );
}
