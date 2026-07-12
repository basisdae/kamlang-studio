# 03 — Design System

# Business Insight Design System

Mobile-first. Minimal, calm, premium, easy to read.

Product identity: **Business Operating System** — not POS, ERP, or accounting software.

Vision & principles (primary guideline): `docs/01-vision.md`  
Naming lock: `docs/00-naming.md`

---

## Design Principles (apply to every screen)

### 1. What next?

Every page must answer: **แล้วเจ้าของร้านควรทำอะไรต่อ?**

Show data only when it leads to a decision or next step.

### 2. Drillable numbers

Important metrics must look and behave as if they can open detail later (link, chevron, card press).

Even when Sprint logic is sample-only, the path must exist in the IA.

### 3. No dead ends

Every screen needs at least one clear action:

เพิ่มรายการ · ดูรายละเอียด · กลับสรุป · ไปหมวดถัดไป

### 4. Timeline-ready structure

Layout and nav must support:

**Opening → Operate → Grow → Insight**

Do not hard-code Opening as the only forever mode.

### 5. Feel like building a business

Tone: calm, confident, action-oriented.  
Avoid dense form-admin aesthetics.

### 6. Mobile First

| Rule | Detail |
|------|--------|
| Primary canvas | Phone (~390px, comfort from 375px) |
| Desktop | Expanded layout of the same composition |
| Forbidden | Designing desktop-first then shrinking |

One-hand use. Touch targets ≥ 44px. No horizontal scroll on small phones.

---

## Brand

| Item | Value |
|------|--------|
| App name | Business Insight |
| Workspace (first) | ตั้งเตา |
| Tagline | Every number tells a story. |

### UI labels (locked)

ภาพรวม · แผนเปิดร้าน · งบประมาณ · ทรัพย์สิน · วัตถุดิบเริ่มต้น · ทีมบริหาร · รายการตรวจสอบ · Business Insight · หมวดหมู่

Sidebar uses **แผนเปิดร้าน** — never bare “Opening”.

---

## Color tokens

| Token | Hex | Use |
|-------|-----|-----|
| background | `#F5F5F2` | Page background |
| surface | `#FFFFFF` | Cards |
| surface-muted | `#ECECE8` | Insets, chips idle |
| text-primary | `#202124` | Body / titles |
| text-secondary | `#74746F` | Captions / helpers |
| border | `#E3E3DE` | Thin borders |
| lemon | `#E7F65B` | Active, primary CTA, progress, highlight |
| lemon-hover | `#DDEA4F` | Primary hover |
| success | `#5FAF7B` | Positive status |
| warning | `#D9A441` | Caution |
| danger | `#D96666` | Critical / Must Have emphasis |

### Lemon rules

- Use lemon only for active state, primary action, progress, and small highlights
- Do **not** use large yellow page backgrounds
- Cards stay white; page stays light gray

## Layout

- Radius ~16–22px (`--kl-radius` ≈ 1.25rem)
- Borders thin; shadows none or very soft
- Icons: `lucide-react` only — no emoji as primary icons

## Navigation

**Mobile bottom:** ภาพรวม · แผนเปิดร้าน · Insight · เพิ่มเติม

**Desktop sidebar:** ภาพรวม · แผนเปิดร้าน · งบประมาณ · ทรัพย์สิน · การจัดซื้อ · วัตถุดิบ · สูตร · Business Insight · ตั้งค่า

## Components (BI)

`PageHeader`, `SummaryCard`, `SummaryMetric`, `MetricCard`, `ProgressCard`, `CategoryCard`, `BudgetItemCard`, `StatusChip`, `StatusBadge`, `PriorityBadge`, `SectionHeader`, `DataSourceBadge`, `ArchiveConfirm`

Shared UI lock: `Button`, `ButtonLink`, `IconButton`, `Card`, `EmptyState`, `SearchBar`, `Badge`, `SegmentChip`, `Dialog`, `Skeleton`, `Loading`, `StatCell`, `FormField`

Field class: `KL_FIELD_CLASS` from `components/ui/designLock.ts`  
Icons: `lucide-react` + `KL_ICON_*` / `KL_ICON_STROKE` from `navConfig`

See also: `components/ui/designLock.ts` (Opening OS component rules).

## Sample vs Real data

Use `<DataSourceBadge source="sample" | "real" />`.

- Sample Data and Real Data can coexist on the same screen later
- Flip `OPENING_DATA_SOURCE` (or per-entity source) without rewriting every page
