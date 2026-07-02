import { getIngredientById } from "../ingredients/IngredientRepository";
import { getPackagingItemById } from "../packaging/PackagingItemRepository";
import { getRecipeById } from "../recipes/RecipeRepository";
import type { KnowledgeEntityType, KnowledgeLookupKey, KnowledgeSeed } from "./types";

export function makeKnowledgeKey(
  entityType: KnowledgeEntityType,
  entityId: string
): KnowledgeLookupKey {
  return `${entityType}:${entityId.trim()}`;
}

function validateKnowledgeSeed(card: KnowledgeSeed): void {
  if (!card.entityType) {
    throw new Error("Knowledge card must have entityType");
  }

  if (!card.entityId.trim()) {
    throw new Error("Knowledge card must have entityId");
  }

  const { entityType, entityId } = card;

  if (entityType === "ingredient" && !getIngredientById(entityId)) {
    throw new Error(
      `Knowledge for ingredient "${entityId}" references unknown ingredient`
    );
  }

  if (entityType === "recipe" && !getRecipeById(entityId)) {
    throw new Error(
      `Knowledge for recipe "${entityId}" references unknown recipe`
    );
  }

  if (entityType === "packaging" && !getPackagingItemById(entityId)) {
    throw new Error(
      `Knowledge for packaging "${entityId}" references unknown packaging item`
    );
  }
}

export function buildKnowledgeIndex(
  seeds: KnowledgeSeed[]
): Map<KnowledgeLookupKey, KnowledgeSeed> {
  const index = new Map<KnowledgeLookupKey, KnowledgeSeed>();
  const seenKeys = new Set<KnowledgeLookupKey>();

  for (const card of seeds) {
    validateKnowledgeSeed(card);

    const key = makeKnowledgeKey(card.entityType, card.entityId);

    if (seenKeys.has(key)) {
      throw new Error(`Duplicate knowledge card: "${key}"`);
    }

    seenKeys.add(key);
    index.set(key, { ...card });
  }

  return index;
}
