"use client";

import { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import CategoryChip from "../../components/ui/CategoryChip";
import EmptyState from "../../components/ui/EmptyState";
import SearchBar from "../../components/ui/SearchBar";
import { EMPTY_STATE } from "../copy/emptyStates";
import { getAllIngredients } from "./IngredientRepository";
import type { Ingredient, IngredientStatus } from "./types";
import {
  formatIngredientPrice,
  getIngredientDisplayUnit,
  getIngredientStatusLabel,
} from "./utils";

function getStatusTone(status: IngredientStatus) {
  if (status === "low") return "draft" as const;
  if (status === "out") return "critical" as const;
  return "ready" as const;
}

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
      description="รายการวัตถุดิบในร้าน"
      backHref="/"
    >
      <SearchBar
        placeholder="ค้นหาวัตถุดิบ..."
        value={search}
        onChange={setSearch}
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
            <Card key={item.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="kl-type-card-title break-words">{item.name}</h2>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <CategoryChip category={item.category} />
                    <span className="kl-type-caption">
                      หน่วยใช้ {getIngredientDisplayUnit(item)}
                    </span>
                  </div>
                </div>

                <Badge tone={getStatusTone(item.status)}>
                  {getIngredientStatusLabel(item.status)}
                </Badge>
              </div>

              <div className="kl-card-emphasis">
                <div className="kl-type-label">คงเหลือ</div>
                <div className="kl-type-metric-lg mt-1">
                  {item.stockQuantity} {item.stockUnit}
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
