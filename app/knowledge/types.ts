/**
 * Knowledge card domain types.
 *
 * Optional operational notes attached to master entities.
 * Master data lives in Ingredient / Recipe / Packaging repositories.
 *
 * @see app/knowledge/README.md
 */

export type KnowledgeEntityType = "ingredient" | "recipe" | "packaging";

export type KnowledgeFields = {
  storage?: string;
  shelfLife?: string;
  supplier?: string;
  preparation?: string;
  warnings?: string;
  tips?: string;
};

export type KnowledgeCard = KnowledgeFields & {
  entityType: KnowledgeEntityType;
  entityId: string;
};

export type KnowledgeSeed = KnowledgeCard;

export type KnowledgeLookupKey = `${KnowledgeEntityType}:${string}`;
