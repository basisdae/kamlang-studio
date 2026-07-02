/**
 * Read-only knowledge cards for ingredients, recipes, and packaging.
 *
 * Attachments to master entities — does not modify IngredientRepository,
 * RecipeRepository, or PackagingItemRepository.
 *
 * @see app/knowledge/README.md
 */
import { knowledgeSeeds } from "../knowledge/seed";
import type {
  KnowledgeCard,
  KnowledgeEntityType,
  KnowledgeLookupKey,
} from "../knowledge/types";
import { buildKnowledgeIndex, makeKnowledgeKey } from "../knowledge/utils";

let knowledgeCache: Map<KnowledgeLookupKey, KnowledgeCard> | null = null;

function loadKnowledge(): Map<KnowledgeLookupKey, KnowledgeCard> {
  if (!knowledgeCache) {
    knowledgeCache = buildKnowledgeIndex(knowledgeSeeds);
  }

  return knowledgeCache;
}

export function getKnowledge(
  entityType: KnowledgeEntityType,
  id: string
): KnowledgeCard | undefined {
  const key = makeKnowledgeKey(entityType, id);
  const card = loadKnowledge().get(key);

  return card ? { ...card } : undefined;
}

export function hasKnowledge(
  entityType: KnowledgeEntityType,
  id: string
): boolean {
  const key = makeKnowledgeKey(entityType, id);
  return loadKnowledge().has(key);
}

export function resetKnowledgeCache(): void {
  knowledgeCache = null;
}
