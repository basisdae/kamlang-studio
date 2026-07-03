"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import SearchBar from "../../components/ui/SearchBar";
import SectionLink from "../../components/ui/SectionLink";
import SectionTitle from "../../components/ui/SectionTitle";
import { calculateMenuCost, getMenuCost } from "../lib/menuCostService";
import { getAllMenus } from "../menu/MenuRepository";
import type { SavedMenu } from "./builder/types";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import MenuLibraryCard from "./components/MenuLibraryCard";
import { filterMenusByName, savedMenuToMenu } from "./utils";
import { getAllSavedMenus } from "../repositories/SavedMenuRepository";

export default function MenusPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);

  const standardMenus = useMemo(
    () => getAllMenus().filter((menu) => menu.isActive),
    []
  );

  useEffect(() => {
    setSavedMenus(getAllSavedMenus());
  }, [pathname]);

  const activeSavedMenus = useMemo(
    () => savedMenus.filter((menu) => menu.isActive),
    [savedMenus]
  );

  const standardMenusWithCost = useMemo(
    () =>
      standardMenus.map((menu) => ({
        menu,
        cost: getMenuCost(menu.id),
      })),
    [standardMenus]
  );

  const savedMenusWithCost = useMemo(
    () =>
      activeSavedMenus.map((savedMenu) => ({
        menu: savedMenuToMenu(savedMenu),
        cost: calculateMenuCost({
          recipeId: savedMenu.recipeId,
          packagingSetId: savedMenu.packagingSetId,
          sellingPrice: savedMenu.sellingPrice,
        }),
      })),
    [activeSavedMenus]
  );

  const allMenusWithCost = useMemo(
    () => [...savedMenusWithCost, ...standardMenusWithCost],
    [savedMenusWithCost, standardMenusWithCost]
  );

  const filteredMenus = useMemo(() => {
    const visibleMenus = filterMenusByName(
      allMenusWithCost.map((entry) => entry.menu),
      search
    );
    const visibleIds = new Set(visibleMenus.map((menu) => menu.id));

    return allMenusWithCost.filter((entry) => visibleIds.has(entry.menu.id));
  }, [allMenusWithCost, search]);

  const filteredSavedMenus = useMemo(
    () =>
      filteredMenus.filter((entry) =>
        activeSavedMenus.some((savedMenu) => savedMenu.id === entry.menu.id)
      ),
    [filteredMenus, activeSavedMenus]
  );

  const filteredStandardMenus = useMemo(
    () =>
      filteredMenus.filter((entry) =>
        standardMenus.some((menu) => menu.id === entry.menu.id)
      ),
    [filteredMenus, standardMenus]
  );

  const hasSearch = search.trim().length > 0;
  const hasVisibleResults = filteredMenus.length > 0;

  return (
    <AppShell
      title="เมนูขาย"
      backHref="/"
    >
      <SearchBar
        placeholder="ค้นหาเมนูขาย..."
        value={search}
        onChange={setSearch}
      />

      <SectionLink
        variant="create"
        href="/menus/new"
        title="สร้างเมนูขาย"
        module="menus"
      />

      {!hasVisibleResults ? (
        hasSearch ? (
          <EmptyState
            {...EMPTY_STATE.menus.search}
            onAction={() => setSearch("")}
          />
        ) : (
          <EmptyState {...EMPTY_STATE.menus.none} />
        )
      ) : null}

      {filteredSavedMenus.length > 0 ? (
        <section className="space-y-3">
          <SectionTitle module="menus">เมนูของคุณ</SectionTitle>
          <div className="space-y-3">
            {filteredSavedMenus.map(({ menu, cost }) => (
              <MenuLibraryCard key={menu.id} menu={menu} cost={cost} />
            ))}
          </div>
        </section>
      ) : null}

      {filteredStandardMenus.length > 0 ? (
        <section className="space-y-3">
          <SectionTitle module="menus">เมนูตัวอย่าง</SectionTitle>
          <div className="space-y-3">
            {filteredStandardMenus.map(({ menu, cost }) => (
              <MenuLibraryCard key={menu.id} menu={menu} cost={cost} />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
