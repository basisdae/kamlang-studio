"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import { KL_ICON_CLASS, KL_ICON_STROKE } from "../../components/layout/navConfig";
import IconButton from "../../components/ui/IconButton";
import SearchBar from "../../components/ui/SearchBar";
import SectionTitle from "../../components/ui/SectionTitle";
import { getModuleIconWellClass } from "../../components/ui/semanticColors";
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
      description="สูตรในครัว"
      backHref="/"
    >
      <SearchBar
        placeholder="ค้นหาสูตรอาหาร..."
        value={search}
        onChange={setSearch}
      />

      <Link href="/recipes/builder" className="kl-section flex items-center gap-3 kl-pressable">
        <div
          className={`${getModuleIconWellClass("recipes")} pointer-events-none`}
          aria-hidden
        >
          <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </div>
        <div>
          <div className="kl-type-card-title">สร้างสูตรใหม่</div>
          <p className="kl-type-helper mt-1">เริ่มสร้างสูตรอาหารและคำนวณต้นทุน</p>
        </div>
      </Link>

      <Link href="/menus/new" className="kl-section flex items-center gap-3 kl-pressable">
        <IconButton className="pointer-events-none" tabIndex={-1} aria-hidden>
          <Plus className={KL_ICON_CLASS} strokeWidth={KL_ICON_STROKE} />
        </IconButton>
        <div>
          <div className="kl-type-card-title">สร้างเมนูขาย</div>
          <p className="kl-type-helper mt-1">ใช้สูตรที่มีอยู่เพื่อสร้างสินค้าที่ขายจริง</p>
        </div>
      </Link>

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
          <SectionTitle module="recipes">สูตรที่ยังไม่เสร็จ</SectionTitle>
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
