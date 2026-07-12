/**
 * Decisions helpers — Decision Queue from Tang Tao seed.
 * Clean-start: empty queue.
 */

export {
  WORKSPACE_NAME,
  type DecisionItem,
  type DecisionPriority,
} from "../../data/seed/tangtao";

import type { DecisionItem, DecisionPriority } from "../../data/seed/tangtao";
import { DECISIONS as SEED_DECISIONS } from "../../data/seed/tangtao";
import { isCleanStart } from "../../lib/bi/cleanStart";

export const DECISIONS: DecisionItem[] = isCleanStart() ? [] : SEED_DECISIONS;

export const DECISION_PRIORITY_LABELS: Record<DecisionPriority, string> = {
  must: "Must",
  should: "Should",
  nice: "Nice",
};

const PRIORITY_ORDER: Record<DecisionPriority, number> = {
  must: 0,
  should: 1,
  nice: 2,
};

/** Queue: Must first, then sooner deadline */
export function sortDecisionQueue(items: DecisionItem[] = DECISIONS) {
  return [...items].sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;
    return a.deadline.localeCompare(b.deadline);
  });
}

export function getDecisionsSummary(items: DecisionItem[] = DECISIONS) {
  const todayKey = "2026-07-11";
  const queue = sortDecisionQueue(items);
  const today = queue.filter((d) => d.deadline === todayKey);
  const must = queue.filter((d) => d.priority === "must");

  return {
    total: queue.length,
    todayCount: today.length,
    mustCount: must.length,
    next: queue[0] ?? null,
  };
}
