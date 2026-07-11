# Naming Convention (locked)

Do not invent alternate names for Opening Plan concepts.

---

## UI (Thai)

| Label |
|-------|
| ภาพรวม |
| แผนเปิดร้าน |
| งบประมาณ |
| ทรัพย์สิน |
| วัตถุดิบเริ่มต้น |
| ทีมบริหาร |
| รายการตรวจสอบ |
| Business Insight |
| หมวดหมู่ |

Sidebar / nav must use **แผนเปิดร้าน** — never bare “Opening”.

---

## Routes

| Route |
|-------|
| `/` |
| `/opening` |
| `/opening/budget` |
| `/opening/assets` |
| `/opening/initial-stock` |
| `/opening/team` |
| `/opening/checklist` |
| `/opening/categories/[id]` |

---

## Code

| Type / symbol | Meaning |
|---------------|---------|
| `BudgetItem` | Line in opening budget |
| `AssetItem` | Store asset (stove, POS, furniture, …) |
| `InitialStockItem` | Opening stock line |
| `CategoryCard` | Category UI card |
| `TeamMember` | Management team member |
| `ChecklistItem` | Opening checklist row |
| `OPENING_CATEGORIES` | Sample/opening category list |

---

## Budget ≠ Investment

| Term | Meaning |
|------|---------|
| **Budget** | งบประมาณเปิดร้าน (spend plan) |
| **Investment** | เงินที่ทีมลงทุนจริง (future ROI / payback) |

Keep these separate from day one.

---

## Assets ≠ Equipment

**ทรัพย์สิน / Assets** covers stove, POS, cabinets, signs, tables, appliances, furniture.

---

## Team ≠ Partners

**ทีมบริหาร / Team** (`/opening/team`, `TeamMember`) — operators and founders (e.g. เดย์ ครีม เก็ต เหมียว), not only investors. May include staff later.

---

## Categories ≠ Collections

Route + code: `categories`. UI: **หมวดหมู่**.
