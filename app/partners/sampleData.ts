/**
 * Thin helpers for Partners summary — prefer partnerService on live screens.
 */

import {
  getEmptyPartnersSummary,
  type PartnersSummary,
} from "../../lib/partners/partnerCore";

export {
  buildPartnersSummary,
  getEmptyPartnersSummary,
  type PartnersSummary,
} from "../../lib/partners/partnerCore";

export function getPartnersSummary(): PartnersSummary {
  return getEmptyPartnersSummary();
}
