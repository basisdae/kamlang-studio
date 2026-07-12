/**
 * Opening route compatibility (v0.3).
 * Keep bookmarks working — never 404 for legacy paths listed here.
 *
 * Implemented as page-level redirect():
 * - /opening/ready          → /opening
 * - /opening/initial-stock  → /opening/checklist/ingredients
 *
 * Views that stay (same bi_assets, owner-language labels):
 * - /opening/assets   ทรัพย์สิน
 * - /opening/budget   งบประมาณ
 * - /opening/checklist รายการเตรียมเปิดร้าน
 * - /opening          Hub dashboard
 */

export const OPENING_LEGACY_REDIRECTS = [
  { from: "/opening/ready", to: "/opening" },
  { from: "/opening/initial-stock", to: "/opening/checklist/ingredients" },
  { from: "/opening/categories/[id]", to: "/opening/checklist" },
] as const;
