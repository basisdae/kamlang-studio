/**
 * Quote Compare — seed re-export + UI labels.
 * Source of truth: data/seed/tangtao.ts
 */

export {
  QUOTE_COMPARE_GROUPS,
  WORKSPACE_NAME,
  type QuoteCompareGroup,
  type QuoteOption,
  type QuotePickTag,
} from "../../data/seed/tangtao";

import type { QuotePickTag } from "../../data/seed/tangtao";

export const QUOTE_PICK_LABELS: Record<QuotePickTag, string> = {
  best_price: "Best Price",
  best_value: "Best Value",
  recommended: "Recommended",
};

export const QUOTE_PICK_TAGS: QuotePickTag[] = [
  "best_price",
  "best_value",
  "recommended",
];
