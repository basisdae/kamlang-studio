"use client";

import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import AppShell from "../../../components/layout/AppShell";
import EmptyState from "../../../components/ui/EmptyState";
import Badge from "../../../components/ui/Badge";
import ButtonLink from "../../../components/ui/ButtonLink";
import Card from "../../../components/ui/Card";
import { EMPTY_STATE } from "../../copy/emptyStates";
import { getMenuById } from "../../menu/MenuRepository";
import { getPackagingItemById } from "../../packaging/PackagingItemRepository";
import { getPackagingSetById } from "../../packaging/PackagingSetRepository";
import { getRecipeById } from "../../recipes/RecipeRepository";
import { getSavedRecipeById } from "../../repositories/SavedRecipeRepository";
import { getSavedMenuById } from "../../repositories/SavedMenuRepository";
import { savedMenuToMenu } from "../utils";
import {
  COST_STATUS_LABEL,
  formatCostBaht,
  formatProfitDisplay,
  getSaleStatus,
  resolveMenuCost,
  SALE_STATUS_LABEL,
} from "../saleStatus";
import MenuActionBar from "./components/MenuActionBar";
import MenuCostSummary from "./components/MenuCostSummary";
import MenuHero from "./components/MenuHero";
import MenuNotes from "./components/MenuNotes";
import MenuPackagingSection from "./components/MenuPackagingSection";
import MenuRecipeSection from "./components/MenuRecipeSection";
import VersionHistoryPanel from "../../../components/versionHistory/VersionHistoryPanel";
import { formatMenuBaht } from "../utils";

export default function MenuDetailPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const id = params.id;

  const detail = useMemo(() => {
    const standardMenu = getMenuById(id);
    const savedMenu = getSavedMenuById(id);
    const menu = standardMenu ?? (savedMenu ? savedMenuToMenu(savedMenu) : null);

    if (!menu) return null;

    const recipeId = menu.recipeId?.trim() || "";
    const standardRecipe = recipeId ? getRecipeById(recipeId) : undefined;
    const savedRecipe = recipeId ? getSavedRecipeById(recipeId) : undefined;

    const recipeName = standardRecipe?.name ?? savedRecipe?.menuName;
    const recipeHref = standardRecipe
      ? `/recipes/${standardRecipe.slug}`
      : savedRecipe
        ? `/recipes/builder?id=${savedRecipe.id}`
        : undefined;

    const costResult = savedMenu
      ? resolveMenuCost(savedMenu)
      : recipeId
        ? resolveMenuCost({
            recipeId,
            packagingSetId: menu.packagingSetId,
            sellingPrice: menu.sellingPrice,
          })
        : { status: "no_recipe" as const, cost: null };

    const packagingSet = menu.packagingSetId
      ? getPackagingSetById(menu.packagingSetId)
      : undefined;
    const packagingItems =
      packagingSet?.items
        .map((itemId) => getPackagingItemById(itemId))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)) ??
      [];

    const saleStatus = savedMenu
      ? getSaleStatus(savedMenu)
      : menu.isActive
        ? ("active" as const)
        : ("draft" as const);

    return {
      menu,
      recipeName,
      recipeHref,
      costStatus: costResult.status,
      cost: costResult.cost,
      packagingSet,
      packagingItems,
      isSavedMenu: Boolean(savedMenu),
      saleStatus,
    };
  }, [id, pathname]);

  if (!detail) {
    return (
      <AppShell title="ไม่พบเมนูขาย" backHref="/menus" hidePageHeader>
        <EmptyState {...EMPTY_STATE.menus.notFound} />
      </AppShell>
    );
  }

  const profit = formatProfitDisplay(
    detail.cost,
    detail.costStatus,
    detail.menu.sellingPrice
  );

  return (
    <AppShell
      title={detail.menu.name}
      description={detail.menu.category || undefined}
      backHref="/menus"
      compact
    >
      <div className="space-y-4 kl-scroll-above-tall-bottom-bar">
        <div className="flex flex-wrap gap-2">
          <Badge
            tone={
              detail.saleStatus === "active"
                ? "success"
                : detail.saleStatus === "draft"
                  ? "draft"
                  : "neutral"
            }
          >
            {SALE_STATUS_LABEL[detail.saleStatus]}
          </Badge>
          <Badge tone="neutral">{COST_STATUS_LABEL[detail.costStatus]}</Badge>
        </div>

        {detail.isSavedMenu ? (
          <VersionHistoryPanel
            entityType="saved_menu"
            entityId={detail.menu.id}
            onRestored={() => window.location.reload()}
          />
        ) : null}

        <MenuHero
          menu={detail.menu}
          sellingPrice={detail.menu.sellingPrice}
        />

        <Card className="!p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div>
              <p className="kl-type-caption text-kl-muted">ราคาขาย</p>
              <p className="kl-type-body">
                {detail.menu.sellingPrice > 0
                  ? `฿${formatMenuBaht(detail.menu.sellingPrice)}`
                  : "ยังไม่ตั้ง"}
              </p>
            </div>
            <div>
              <p className="kl-type-caption text-kl-muted">ต้นทุน</p>
              <p className="kl-type-body">
                {formatCostBaht(detail.cost, detail.costStatus)}
              </p>
            </div>
            <div>
              <p className="kl-type-caption text-kl-muted">กำไร / GP</p>
              <p className="kl-type-body">
                {profit.profit} · {profit.gp}
              </p>
            </div>
          </div>
        </Card>

        {detail.recipeHref && detail.recipeName ? (
          <MenuRecipeSection
            recipeName={detail.recipeName}
            recipeHref={detail.recipeHref}
          />
        ) : (
          <Card className="space-y-2 !p-3">
            <p className="kl-type-helper">ยังไม่มีสูตร — สามารถเปิดขายได้ก่อน</p>
            {detail.isSavedMenu ? (
              <div className="flex flex-wrap gap-2">
                <ButtonLink
                  href={`/recipes/builder?linkMenuId=${encodeURIComponent(detail.menu.id)}&menuName=${encodeURIComponent(detail.menu.name)}`}
                  size="sm"
                  className="min-h-[40px]"
                >
                  สร้างสูตรจากเมนูนี้
                </ButtonLink>
                <ButtonLink
                  href={`/menus/${detail.menu.id}/edit`}
                  variant="secondary"
                  size="sm"
                  className="min-h-[40px]"
                >
                  เชื่อมสูตรที่มีอยู่
                </ButtonLink>
              </div>
            ) : null}
          </Card>
        )}

        {detail.cost ? <MenuCostSummary cost={detail.cost} /> : null}

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
