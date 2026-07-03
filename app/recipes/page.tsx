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
  deleteSavedRecipe,
  duplicateSavedRecipe,
  filterSavedRecipes,
  getBuilderSavedRecipes,
} from "../repositories/SavedRecipeRepository";
import { getAllRecipes } from "./RecipeRepository";
import type { SavedRecipe } from "./builder/types";
import { filterRecipes } from "./utils";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import RecipeLibraryCard from "./components/RecipeLibraryCard";
import SavedRecipeLibraryCard from "./components/SavedRecipeLibraryCard";

export default function RecipesPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);

  const standardRecipes = useMemo(() => getAllRecipes(), []);

  useEffect(() => {
    setSavedRecipes(getBuilderSavedRecipes());
  }, [pathname]);

  const filteredStandardRecipes = useMemo(
    () => filterRecipes(standardRecipes, search),
    [standardRecipes, search]
  );

  const filteredSavedRecipes = useMemo(
    () => filterSavedRecipes(savedRecipes, search),
    [savedRecipes, search]
  );

  function refreshSavedRecipes() {
    setSavedRecipes(getBuilderSavedRecipes());
  }

  function handleDuplicate(id: string) {
    duplicateSavedRecipe(id);
    refreshSavedRecipes();
  }

  function handleDelete(id: string) {
    deleteSavedRecipe(id);
    refreshSavedRecipes();
  }

  const hasSearch = search.trim().length > 0;
  const hasVisibleResults =
    filteredStandardRecipes.length > 0 || filteredSavedRecipes.length > 0;

  return (
    <AppShell
      title="สูตรอาหาร"
      backHref="/"
    >
      <SearchBar
        placeholder="ค้นหาสูตรอาหาร..."
        value={search}
        onChange={setSearch}
      />

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
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      ) : null}

      {filteredStandardRecipes.length > 0 ? (
        <section className="space-y-3">
          <SectionTitle module="recipes">สูตรตัวอย่าง</SectionTitle>
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
