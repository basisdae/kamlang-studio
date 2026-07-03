import {
  getAllIngredients,
  getIngredientById,
} from "../ingredients/IngredientRepository";
import { getAllMenus, getMenuById } from "../menu/MenuRepository";
import { savedMenuToMenu } from "../menus/utils";
import { getAllPlans } from "../production/ProductionRepository";
import { formatProductionDate } from "../production/utils";
import type { ProductionPlan } from "../production/types";
import { getAllRecipes } from "../recipes/RecipeRepository";
import { getBuilderSavedRecipes } from "../repositories/SavedRecipeRepository";
import { getAllSavedMenus } from "../repositories/SavedMenuRepository";
import {
  getAllSavedProductionPlans,
  getHiddenProductionDates,
} from "../repositories/SavedProductionRepository";
import { getAllInventory } from "../inventory/InventoryRepository";
import {
  getInventoryStatus,
  getInventoryStatusLabel,
} from "../inventory/utils";
import { getSavedInventoryAdjustment } from "../repositories/SavedInventoryRepository";
import type {
  GlobalSearchResult,
  GlobalSearchResults,
  SearchResultGroup,
} from "../search/types";
import { SEARCH_GROUP_ORDER } from "../search/types";

const MAX_RESULTS_PER_GROUP = 10;

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function matchesQuery(query: string, ...values: Array<string | undefined>): boolean {
  if (!query) return false;

  return values.some((value) => value?.toLowerCase().includes(query));
}

function emptyResults(): GlobalSearchResults {
  return {
    ingredients: [],
    recipes: [],
    menus: [],
    production: [],
    inventory: [],
  };
}

function getSearchableProductionPlans(): ProductionPlan[] {
  const hiddenDates = new Set(getHiddenProductionDates());
  const saved = getAllSavedProductionPlans().filter(
    (plan) => !hiddenDates.has(plan.date)
  );
  const savedDates = new Set(saved.map((plan) => plan.date));
  const seed = getAllPlans().filter(
    (plan) => !savedDates.has(plan.date) && !hiddenDates.has(plan.date)
  );

  return [...saved, ...seed];
}

function searchIngredients(query: string): GlobalSearchResult[] {
  return getAllIngredients()
    .filter((item) =>
      matchesQuery(query, item.name, item.category, item.id)
    )
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((item) => ({
      id: `ingredient-${item.id}`,
      group: "ingredients" as const,
      title: item.name,
      subtitle: item.category,
      href: "/ingredients",
    }));
}

function searchRecipes(query: string): GlobalSearchResult[] {
  const standard = getAllRecipes()
    .filter((recipe) =>
      matchesQuery(query, recipe.name, recipe.category, recipe.slug, recipe.id)
    )
    .map((recipe) => ({
      id: `recipe-${recipe.id}`,
      group: "recipes" as const,
      title: recipe.name,
      subtitle: recipe.category,
      href: `/recipes/${recipe.slug}`,
    }));

  const saved = getBuilderSavedRecipes()
    .filter((recipe) =>
      matchesQuery(query, recipe.menuName, recipe.category, recipe.id)
    )
    .map((recipe) => ({
      id: `saved-recipe-${recipe.id}`,
      group: "recipes" as const,
      title: recipe.menuName,
      subtitle: recipe.category,
      href: `/recipes/builder?id=${recipe.id}`,
    }));

  return [...saved, ...standard].slice(0, MAX_RESULTS_PER_GROUP);
}

function searchMenus(query: string): GlobalSearchResult[] {
  const byId = new Map<string, GlobalSearchResult>();

  for (const menu of getAllMenus()) {
    if (!matchesQuery(query, menu.name, menu.category, menu.id)) continue;

    byId.set(menu.id, {
      id: `menu-${menu.id}`,
      group: "menus",
      title: menu.name,
      subtitle: menu.category,
      href: `/menus/${menu.id}`,
    });
  }

  for (const savedMenu of getAllSavedMenus()) {
    const menu = savedMenuToMenu(savedMenu);
    if (!matchesQuery(query, menu.name, menu.category, menu.id)) continue;

    byId.set(menu.id, {
      id: `menu-${menu.id}`,
      group: "menus",
      title: menu.name,
      subtitle: menu.category,
      href: `/menus/${menu.id}`,
    });
  }

  return Array.from(byId.values()).slice(0, MAX_RESULTS_PER_GROUP);
}

function getProductionPlanSubtitle(plan: ProductionPlan): string {
  const menuNames = plan.lines
    .map((line) => getMenuById(line.menuId)?.name)
    .filter((name): name is string => Boolean(name));

  const uniqueNames = [...new Set(menuNames)];
  const menuSummary =
    uniqueNames.length > 0
      ? uniqueNames.slice(0, 2).join(", ")
      : `${plan.lines.length} เมนูขาย`;

  return `${formatProductionDate(plan.date)} • ${menuSummary}`;
}

function searchProductionPlans(query: string): GlobalSearchResult[] {
  return getSearchableProductionPlans()
    .filter((plan) => {
      const formattedDate = formatProductionDate(plan.date);
      const menuNames = plan.lines
        .map((line) => getMenuById(line.menuId)?.name)
        .filter((name): name is string => Boolean(name));

      return matchesQuery(
        query,
        plan.id,
        plan.date,
        formattedDate,
        ...menuNames
      );
    })
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((plan) => ({
      id: `production-${plan.id}`,
      group: "production" as const,
      title: `แผนวันนี้ ${formatProductionDate(plan.date)}`,
      subtitle: getProductionPlanSubtitle(plan),
      href: `/production/edit?date=${encodeURIComponent(plan.date)}`,
    }));
}

function searchInventory(query: string): GlobalSearchResult[] {
  return getAllInventory()
    .map((seed) => {
      const saved = getSavedInventoryAdjustment(seed.ingredientId);
      const item = saved
        ? {
            ...seed,
            stockQuantity: saved.stockQuantity,
            minQuantity: saved.minQuantity,
          }
        : seed;
      const ingredient = getIngredientById(item.ingredientId);
      const name = ingredient?.name ?? item.ingredientId;

      return { item, name, ingredient };
    })
    .filter(({ name, ingredient, item }) =>
      matchesQuery(
        query,
        name,
        ingredient?.category,
        item.ingredientId,
        item.unit
      )
    )
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map(({ item, name }) => ({
      id: `inventory-${item.ingredientId}`,
      group: "inventory" as const,
      title: name,
      subtitle: `${getInventoryStatusLabel(getInventoryStatus(item))} • ${item.stockQuantity} ${item.unit}`,
      href: "/inventory",
    }));
}

/**
 * Search core restaurant data from existing repositories.
 */
export function searchGlobal(query: string): GlobalSearchResults {
  const normalized = normalizeQuery(query);
  if (!normalized) return emptyResults();

  return {
    ingredients: searchIngredients(normalized),
    recipes: searchRecipes(normalized),
    menus: searchMenus(normalized),
    production: searchProductionPlans(normalized),
    inventory: searchInventory(normalized),
  };
}

export function getGlobalSearchResultCount(results: GlobalSearchResults): number {
  return SEARCH_GROUP_ORDER.reduce(
    (total, group) => total + results[group].length,
    0
  );
}

export function hasGlobalSearchResults(results: GlobalSearchResults): boolean {
  return getGlobalSearchResultCount(results) > 0;
}

export function getResultsForGroup(
  results: GlobalSearchResults,
  group: SearchResultGroup
): GlobalSearchResult[] {
  return results[group];
}
