"use client";

import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import AppShell from "../../../components/layout/AppShell";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import { EMPTY_STATE } from "../../copy/emptyStates";
import { calculateMenuCost, getMenuCost } from "../../lib/menuCostService";
import { getMenuById } from "../../menu/MenuRepository";
import { getPackagingItemById } from "../../packaging/PackagingItemRepository";
import { getPackagingSetById } from "../../packaging/PackagingSetRepository";
import { getRecipeById } from "../../recipes/RecipeRepository";
import { getSavedRecipeById } from "../../repositories/SavedRecipeRepository";
import { getSavedMenuById } from "../../repositories/SavedMenuRepository";
import { savedMenuToMenu } from "../utils";
import MenuActionBar from "./components/MenuActionBar";
import MenuCostSummary from "./components/MenuCostSummary";
import MenuHero from "./components/MenuHero";
import MenuNotes from "./components/MenuNotes";
import MenuPackagingSection from "./components/MenuPackagingSection";
import MenuRecipeSection from "./components/MenuRecipeSection";
import VersionHistoryPanel from "../../../components/versionHistory/VersionHistoryPanel";

export default function MenuDetailPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const id = params.id;

  const detail = useMemo(() => {
    const standardMenu = getMenuById(id);
    const savedMenu = getSavedMenuById(id);
    const menu = standardMenu ?? (savedMenu ? savedMenuToMenu(savedMenu) : null);

    if (!menu) return null;

    const standardRecipe = getRecipeById(menu.recipeId);
    const savedRecipe = getSavedRecipeById(menu.recipeId);
    if (!standardRecipe && !savedRecipe) return null;

    const recipeName = standardRecipe?.name ?? savedRecipe!.menuName;
    const recipeHref = standardRecipe
      ? `/recipes/${standardRecipe.slug}`
      : `/recipes/builder?id=${savedRecipe!.id}`;

    let cost;
    try {
      cost = standardMenu
        ? getMenuCost(menu.id)
        : calculateMenuCost({
            recipeId: menu.recipeId,
            packagingSetId: menu.packagingSetId,
            sellingPrice: menu.sellingPrice > 0 ? menu.sellingPrice : 0.01,
          });
      if (!standardMenu && menu.sellingPrice <= 0) {
        cost = {
          ...cost,
          sellingPrice: 0,
          grossProfit: 0 - cost.totalCost,
          grossProfitPercent: 0,
        };
      }
    } catch {
      return null;
    }

    const packagingSet = menu.packagingSetId
      ? getPackagingSetById(menu.packagingSetId)
      : undefined;
    const packagingItems =
      packagingSet?.items
        .map((itemId) => getPackagingItemById(itemId))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)) ??
      [];

    return {
      menu,
      recipeName,
      recipeHref,
      cost,
      packagingSet,
      packagingItems,
      isSavedMenu: Boolean(savedMenu),
      isDraft: Boolean(savedMenu && !savedMenu.isActive),
    };
  }, [id, pathname]);

  if (!detail) {
    return (
      <AppShell title="ไม่พบเมนูขาย" backHref="/menus" hidePageHeader>
        <EmptyState {...EMPTY_STATE.menus.notFound} />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={detail.menu.name}
      description={detail.menu.category || undefined}
      backHref="/menus"
      compact
    >
      <div className="space-y-4 kl-scroll-above-tall-bottom-bar">
        {detail.isDraft ? (
          <Badge tone="draft">แบบร่าง — ยังไม่เปิดขาย</Badge>
        ) : null}

        {detail.isSavedMenu ? (
          <VersionHistoryPanel
            entityType="saved_menu"
            entityId={detail.menu.id}
            onRestored={() => window.location.reload()}
          />
        ) : null}

        <MenuHero menu={detail.menu} sellingPrice={detail.cost.sellingPrice} />
        <MenuRecipeSection
          recipeName={detail.recipeName}
          recipeHref={detail.recipeHref}
        />
        <MenuCostSummary cost={detail.cost} />
        <MenuPackagingSection
          packagingSet={detail.packagingSet}
          items={detail.packagingItems}
          editHref={
            detail.isSavedMenu ? `/menus/${detail.menu.id}/edit` : undefined
          }
        />
        <MenuNotes notes={detail.menu.notes} />
      </div>
      <MenuActionBar
        menuId={detail.menu.id}
        isEditable={detail.isSavedMenu}
      />
    </AppShell>
  );
}
