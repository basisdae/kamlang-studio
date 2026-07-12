/**
 * Quote Compare — seed re-export + UI labels.
 * Clean-start: no mock quote groups.
 */

export {
  WORKSPACE_NAME,
  type QuoteCompareGroup,
  type QuoteOption,
  type QuotePickTag,
} from "../../data/seed/tangtao";

import type { QuoteCompareGroup, QuotePickTag } from "../../data/seed/tangtao";
import { QUOTE_COMPARE_GROUPS as SEED_QUOTE_COMPARE_GROUPS } from "../../data/seed/tangtao";
import { isCleanStart } from "../../lib/bi/cleanStart";

export const QUOTE_COMPARE_GROUPS: QuoteCompareGroup[] = isCleanStart()
  ? []
  : SEED_QUOTE_COMPARE_GROUPS;

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
