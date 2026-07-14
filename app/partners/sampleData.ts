/**
 * Partners summary for cross-workspace readouts (e.g. Finance landing link).
 * Shared Core only — never seed/mock/localStorage.
 */

import {
  getEmptyPartnersSummary,
  type PartnersSummary,
} from "../../lib/partners/partnerCore";

export type { PartnersSummary };

export function getPartnersSummary(): PartnersSummary {
  return getEmptyPartnersSummary();
}
