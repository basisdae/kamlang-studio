"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell";
import Card from "../../components/ui/Card";
import SearchBar from "../../components/ui/SearchBar";
import { getIngredientById } from "../ingredients/IngredientRepository";
import {
  getEffectiveAllInventory,
  getEffectiveInventoryByIngredientId,
  getEffectiveLowStockItems,
  getEffectiveOutOfStockItems,
  getSavedNoteForIngredient,
} from "./inventoryAccess";
import InventoryHero from "./components/InventoryHero";
import InventoryAdjustSheet from "./components/InventoryAdjustSheet";
import InventoryCard from "./components/InventoryCard";
import InventoryFilterBar from "./components/InventoryFilterBar";
import EmptyState from "../../components/ui/EmptyState";
import { EMPTY_STATE } from "../copy/emptyStates";
import type { InventoryStatus } from "./types";

type InventoryFilter = "all" | InventoryStatus;

function getInventoryForFilter(filter: InventoryFilter) {
  switch (filter) {
    case "low":
      return getEffectiveLowStockItems();
    case "out":
      return getEffectiveOutOfStockItems();
    default:
      return getEffectiveAllInventory();
  }
}

function filterBySearch(
  items: ReturnType<typeof getEffectiveAllInventory>,
  search: string
) {
  const query = search.trim().toLowerCase();
  if (!query) return items;

  return items.filter((item) => {
    const ingredient = getIngredientById(item.ingredientId);
    const name = ingredient?.name ?? item.ingredientId;

    return name.toLowerCase().includes(query);
  });
}

export default function InventoryPage() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InventoryFilter>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(
    null
  );

  const inventory = useMemo(
    () => getInventoryForFilter(filter),
    [filter, refreshKey, pathname]
  );
  const filteredInventory = useMemo(
    () => filterBySearch(inventory, search),
    [inventory, search]
  );

  const hasAnyInventory = useMemo(
    () => getEffectiveAllInventory().length > 0,
    [refreshKey, pathname]
  );

  const selectedItem = useMemo(() => {
    if (!selectedIngredientId) return null;

    return getEffectiveInventoryByIngredientId(selectedIngredientId) ?? null;
  }, [selectedIngredientId, refreshKey]);

  const selectedNote = selectedIngredientId
    ? getSavedNoteForIngredient(selectedIngredientId)
    : undefined;

  const lowCount = useMemo(
    () => getEffectiveLowStockItems().length,
    [refreshKey, pathname]
  );
  const outCount = useMemo(
    () => getEffectiveOutOfStockItems().length,
    [refreshKey, pathname]
  );
  const totalItems = useMemo(
    () => getEffectiveAllInventory().length,
    [refreshKey, pathname]
  );

  function handleSaved() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <AppShell
      title="ของในครัว"
      backHref="/"
      compact
    >
      <InventoryHero
        totalItems={totalItems}
        lowCount={lowCount}
        outCount={outCount}
      />

      <SearchBar
        placeholder="ค้นหาวัตถุดิบ..."
        value={search}
        onChange={setSearch}
      />

      <InventoryFilterBar value={filter} onChange={setFilter} />

      <div className="space-y-3">
        {!hasAnyInventory ? (
          <EmptyState {...EMPTY_STATE.inventory.none} />
        ) : filteredInventory.length === 0 ? (
          search.trim() ? (
            <EmptyState
              {...EMPTY_STATE.inventory.search}
              onAction={() => setSearch("")}
            />
          ) : (
            <EmptyState
              {...EMPTY_STATE.inventory.filter}
              onAction={() => setFilter("all")}
            />
          )
        ) : (
          filteredInventory.map((item) => (
            <InventoryCard
              key={item.ingredientId}
              item={item}
              note={getSavedNoteForIngredient(item.ingredientId)}
              onSelect={() => setSelectedIngredientId(item.ingredientId)}
            />
          ))
        )}
      </div>

      {selectedItem ? (
        <InventoryAdjustSheet
          item={selectedItem}
          note={selectedNote}
          isOpen={Boolean(selectedIngredientId)}
          onClose={() => setSelectedIngredientId(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </AppShell>
  );
}
