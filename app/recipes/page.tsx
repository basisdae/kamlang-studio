"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import SearchBar from "../../components/ui/SearchBar";
import SectionLink from "../../components/ui/SectionLink";
import SectionTitle from "../../components/ui/SectionTitle";
import {
  getStandardRecipeCost,
  getRecipeReferencePrice,
} from "../lib/costService";
import {
  archiveSavedRecipe,
  deleteSavedRecipe,
  duplicateSavedRecipe,
  filterSavedRecipes,
  getBuilderSavedRecipes,
  restoreSavedRecipe,
} from "../repositories/SavedRecipeRepository";
import { getAllRecipes } from "./RecipeRepository";
import type { SavedRecipe } from "./builder/types";
import {
  normalizeSavedRecipeStatus,
  SAVED_RECIPE_STATUS_FILTERS,
} from "./builder/status";
import { filterRecipes } from "./utils";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import RecipeLibraryCard from "./components/RecipeLibraryCard";
import SavedRecipeLibraryCard from "./components/SavedRecipeLibraryCard";

type StatusFilter = (typeof SAVED_RECIPE_STATUS_FILTERS)[number]["id"];

export default function RecipesPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [deleteBlocked, setDeleteBlocked] = useState<Record<string, string>>(
    {}
  );

  const standardRecipes = useMemo(() => getAllRecipes(), []);

  useEffect(() => {
    setSavedRecipes(getBuilderSavedRecipes());
  }, [pathname]);

  const filteredStandardRecipes = useMemo(
    () => filterRecipes(standardRecipes, search),
    [standardRecipes, search]
  );

  const filteredSavedRecipes = useMemo(() => {
    const bySearch = filterSavedRecipes(savedRecipes, search);
    return bySearch.filter((recipe) => {
      const status = normalizeSavedRecipeStatus(recipe);
      if (statusFilter === "all") return true;
      if (statusFilter === "active") return status !== "archived";
      return status === statusFilter;
    });
  }, [savedRecipes, search, statusFilter]);

  function refreshSavedRecipes() {
    setSavedRecipes(getBuilderSavedRecipes());
  }

  function handleDuplicate(id: string) {
    duplicateSavedRecipe(id);
    refreshSavedRecipes();
  }

  function handleArchive(id: string) {
    archiveSavedRecipe(id);
    refreshSavedRecipes();
  }

  function handleRestore(id: string) {
    restoreSavedRecipe(id);
    refreshSavedRecipes();
  }

  function handleDelete(id: string) {
    const result = deleteSavedRecipe(id);
    if (!result.ok) {
      setDeleteBlocked((current) => ({
        ...current,
        [id]: "สูตรนี้เชื่อมกับเมนูอยู่ — เก็บถาวรแทน หรือจัดการเมนูก่อนลบ (เมนูจะไม่ถูกลบตาม)",
      }));
      return;
    }
    setDeleteBlocked((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    refreshSavedRecipes();
  }

  const hasSearch = search.trim().length > 0;
  const hasVisibleResults =
    filteredStandardRecipes.length > 0 || filteredSavedRecipes.length > 0;

  return (
    <AppShell title="สูตรอาหาร" backHref="/">
      <SearchBar
        placeholder="ค้นหาสูตรอาหาร..."
        value={search}
        onChange={setSearch}
      />

      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SAVED_RECIPE_STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setStatusFilter(filter.id)}
            className={`min-h-[36px] shrink-0 rounded-full px-3 text-[13px] font-medium ${
              statusFilter === filter.id
                ? "bg-kl-brown text-kl-ivory"
                : "border border-kl-border bg-kl-card text-kl-muted"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <SectionLink
        variant="create"
        href="/recipes/builder"
        title="สร้างสูตรใหม่"
        module="recipes"
      />

      {!hasVisibleResults ? (
        hasSearch ? (
          <EmptyState
            {...EMPTY_STATE.recipes.search}
            onAction={() => setSearch("")}
          />
        ) : (
          <EmptyState {...EMPTY_STATE.recipes.none} />
        )
      ) : null}

      {filteredSavedRecipes.length > 0 ? (
        <section className="space-y-3">
          <SectionTitle module="recipes">สูตรที่กำลังทำอยู่</SectionTitle>
          <div className="space-y-3">
            {filteredSavedRecipes.map((recipe) => (
              <SavedRecipeLibraryCard
                key={recipe.id}
                recipe={recipe}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
                deleteBlockedMessage={deleteBlocked[recipe.id] ?? null}
                onClearDeleteBlocked={() =>
                  setDeleteBlocked((current) => {
                    const next = { ...current };
                    delete next[recipe.id];
                    return next;
                  })
                }
              />
            ))}
          </div>
        </section>
      ) : null}

      {filteredStandardRecipes.length > 0 &&
      (statusFilter === "active" || statusFilter === "all") ? (
        <section className="space-y-3">
          <SectionTitle module="recipes">สูตรมาตรฐาน</SectionTitle>
          <div className="space-y-3">
            {filteredStandardRecipes.map((recipe) => (
              <RecipeLibraryCard
                key={recipe.id}
                recipe={recipe}
                totalCost={getStandardRecipeCost(recipe)}
                suggestedPrice={getRecipeReferencePrice(recipe)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
