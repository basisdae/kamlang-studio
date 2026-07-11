# 04 — Business Rules

# Business Insight — Business Rules

Naming lock: `docs/00-naming.md`.

---

## Scope rules

1. **Not a POS** — do not take orders or print receipts in this app.
2. **External POS** is the future source of sales totals (and delivery apps).
3. **Phase 1 focus** = Opening Plan + Budget planning.
4. **Team** — `TeamMember` / `/opening/team`; UI: ทีมบริหาร; share percents should sum to **100%**.
5. **Drill-down** — every important number should eventually open a detail path (“no dead-end screens”).
6. **Mobile first** — primary device is phone (~390px).
7. **Sample honesty** — Sample Data must be labeled via `DataSourceBadge`; never look like live books or fake charts that imply real analytics. Sample and Real can coexist.

## Budget ≠ Investment

| Term | Meaning |
|------|---------|
| Budget | งบประมาณเปิดร้าน |
| Investment | เงินที่ทีมลงทุนจริง (future payback) |

## Budget priority

| Priority | Meaning |
|----------|---------|
| Must Have | Required to open |
| Should Have | Important but can wait briefly |
| Nice to Have | Optional polish |

## Budget status

| Status | Meaning |
|--------|---------|
| ยังไม่หาราคา | No quote yet |
| รอเปรียบเทียบ | Comparing suppliers |
| วางแผนซื้อ | Planned purchase |
| ซื้อแล้ว | Purchased |
| ยกเลิก | Cancelled |

## Opening categories (Phase 1)

อุปกรณ์ทำอาหาร · ตู้และการจัดเก็บ · แพ็กเกจ · หน้าร้านและป้าย · ระบบและ POS · วัตถุดิบเริ่มต้น · การตลาดก่อนเปิด · ค่าใช้จ่ายอื่น

UI label: **หมวดหมู่** · code/route: `categories`

## Legacy Kamlang rules

- Do not delete Recipe / Product / kitchen flows without an explicit decision.
- Do not change food-cost formulas without approval (see `docs/GLOSSARY.md`).
- Sprint 0 does not modify recipe/product logic.

## Technical constraints (Sprint 0)

- No Supabase
- No Auth
- No real financial engine
- No commit/push until review after green build
