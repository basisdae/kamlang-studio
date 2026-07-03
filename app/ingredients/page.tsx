"use client";

import { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import CategoryChip from "../../components/ui/CategoryChip";
import EmptyState from "../../components/ui/EmptyState";
import SearchBar from "../../components/ui/SearchBar";
import SectionLink from "../../components/ui/SectionLink";
import { EMPTY_STATE } from "../copy/emptyStates";
import { getAllIngredients } from "./IngredientRepository";
import type { Ingredient } from "./types";
import {
  formatIngredientPrice,
  getIngredientDisplayUnit,
} from "./utils";

function filterBySearch(ingredients: Ingredient[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return ingredients;

  return ingredients.filter(
    (item) =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
  );
}

export default function IngredientsPage() {
  const [search, setSearch] = useState("");

  const ingredients = useMemo(() => getAllIngredients(), []);
  const filteredIngredients = useMemo(
    () => filterBySearch(ingredients, search),
    [ingredients, search]
  );

  return (
    <AppShell
      title="วัตถุดิบ"
      description="รายการและราคาซื้อ"
      backHref="/"
      compact
    >
      <SearchBar
        placeholder="ค้นหาวัตถุดิบ..."
        value={search}
        onChange={setSearch}
      />

      <SectionLink
        variant="nav"
        href="/import"
        label="เพิ่มวัตถุดิบ"
        title="นำเข้าจาก Excel"
      />

      <div className="space-y-3">
        {filteredIngredients.length === 0 ? (
          ingredients.length === 0 ? (
            <EmptyState {...EMPTY_STATE.ingredients.none} />
          ) : (
            <EmptyState
              {...EMPTY_STATE.ingredients.search}
              onAction={() => setSearch("")}
            />
          )
        ) : (
          filteredIngredients.map((item) => (
            <Card key={item.id} className="space-y-2">
              <div className="min-w-0">
                <h2 className="kl-type-card-title break-words">{item.name}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <CategoryChip category={item.category} />
                  <span className="kl-type-caption">
                    หน่วยใช้ {getIngredientDisplayUnit(item)}
                  </span>
                </div>
              </div>

              <div className="kl-type-caption">
                ราคา {formatIngredientPrice(item)} ต่อ{getIngredientDisplayUnit(item)}
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  );
}
