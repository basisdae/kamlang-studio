# 01 — Vision

> **Primary project guideline.** All Naming, Routes, Components, and UI decisions for Business Insight must follow this document.

# Business Insight

**Every number tells a story.**

Business Insight is a **Business Operating System** for restaurant owners — starting with workspace **ตั้งเตา**.

It helps owners build and grow the business — not fill forms, not run a till, not close the books.

---

## Business Insight Philosophy

Business Insight is **not** here to “store data.”

Its job is to **help owners decide**.

So every screen — whether it shows:

- งบประมาณ
- อุปกรณ์ / ทรัพย์สิน
- วัตถุดิบ
- ทีม
- รายรับ
- รายจ่าย
- กำไร

— must answer:

> **แล้วเราควรทำอะไรต่อ?**

If a screen only lists information with no next decision, it is incomplete.

---

## What it is

A mobile-first operating layer to:

- Plan opening budget before the shop opens
- Track assets, purchases, and team shares
- Grow with the business lifecycle (see Future Direction)
- Drill into every number (no dead-end screens)
- Always surface the next useful action

## What it is not

- Not a POS
- Not an ERP
- Not a full accounting program
- Not an order-taking app
- Not a passive data archive

Sales stay on an **external POS** and delivery channels (Grab / LINE MAN). Those become future data sources for Insight — they are not rebuilt here.

---

## UI Principles

### Context vs Content (Platform lock)

**Workspace Switcher = Context** (show once).  
**Page Header = Content** (the work on this screen).

| Layer | Owns | Does not |
|--------|------|----------|
| Workspace Switcher | Which Workspace the user is in (full name, readable in ≤1s) | Page job title, summary, primary CTA |
| Page Header | What the user is doing now (ภาพรวม, จัดซื้อ, สูตร, …) | Repeat the Workspace name |

Examples:

```
ดำเนินกิจการ ▼
ภาพรวม

ดำเนินกิจการ ▼
จัดซื้อ

วิจัยและพัฒนา ▼
สูตร
```

Forbidden: Switcher shows `ดำเนินกิจการ` and Header also titles the page `ดำเนินกิจการ`.

Context and Content must not share the same label on one screen.

### Page layers

Every page must include these four layers (not a bare data list):

| # | Layer | Role |
|---|--------|------|
| 1 | **ภาพรวม** | Where we stand right now |
| 2 | **สิ่งที่ควรทำต่อ** | The next decision or action |
| 3 | **รายละเอียด** | Enough context to trust the number |
| 4 | **Action** | A clear path: add, open detail, go next, return to summary |

Screens that only dump rows without overview + next step + action fail this guideline.

---

## Future Direction

Business Insight grows with the business cycle.

Naming, routes, and components must stay expandable across phases:

```
Phase 1 — เปิดร้าน (Opening)
    ↓
Phase 2 — บริหารร้าน (Operate)
    ↓
Phase 3 — เติบโต (Grow)
    ↓
Phase 4 — วิเคราะห์ธุรกิจ (Insight)
```

Do not design Phase 1 as a dead-end product shape. Timeline thinking is mandatory.

---

## Business Insight Design Principles

### 1. Always answer “what next?”

Every screen must answer:

> แล้วเจ้าของร้านควรทำอะไรต่อ? / แล้วเราควรทำอะไรต่อ?

Not just display data.

Examples:

- งบประมาณเหลือเท่าไร → ควรซื้ออะไรต่อ
- เหลืออะไรที่ยังไม่พร้อมเปิดร้าน → ไปทำรายการนั้นต่อ

### 2. Every number is drillable

Every important number must be tappable for detail in the future.

Example: งบประมาณ → tap → รายการทั้งหมด

Early sprints may not ship full logic, but UI must feel extendable (links, chevrons, clear next paths).

### 3. No dead-end screens

Every page needs a next action, such as:

- เพิ่มรายการ
- ดูรายละเอียด
- กลับสรุป
- ไปหมวดถัดไป

### 4. Think in Timeline

Structure and naming must support Opening → Operate → Grow → Insight.

### 5. Business Operating System — not admin software

Every screen should feel like **building and developing the business**, not data entry.

Calm, decisive, action-oriented.

### 6. Mobile First (project-wide)

Design for phone first. Desktop is an expanded layout only.

Never design desktop first.

---

## Product filter

> Will this help a restaurant owner decide faster and feel less stressed?

If not, do not add it.

## Honesty

Sample Data and Real Data can coexist. Label sources clearly (`DataSourceBadge`) so owners never confuse demos with live books.

## Related docs

| Doc | Role |
|-----|------|
| `docs/00-naming.md` | Locked vocabulary (Budget ≠ Investment, …) |
| `docs/02-roadmap.md` | Phased delivery |
| `docs/03-design-system.md` | Visual + UI system (follows this vision) |
| `docs/04-business-rules.md` | Domain rules |
