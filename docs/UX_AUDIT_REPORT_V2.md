# Restaurant UX Audit Report V2

**Audit date:** July 2026  
**Lens:** First-time restaurant owner, mobile (390px), after closing shift  
**Rules:** No business logic changes — copy, layout, and navigation wiring only

---

## How to read this report

Each issue follows:

| Field | Meaning |
|-------|---------|
| **Problem** | Specific UI element and copy |
| **Reason** | Why it confuses a first-time owner |
| **Suggested improvement** | Copy/layout fix |
| **Status** | `Implemented` or `Open` |

---

## Already improved (prior work)

| Item | Status |
|------|--------|
| Production hero action hierarchy (edit / duplicate / overflow delete) | Implemented (Production Action Hierarchy V1) |
| Empty states with title + hint + CTA | Implemented (Empty State Polish) |
| Loading skeletons on builder/edit/import | Implemented (Loading UX) |

---

## Cross-cutting themes

| Theme | Routes | Status |
|-------|--------|--------|
| Naming: วัตถุดิบ / สต๊อก / ของในครัว | Nav, search, inventory | Partially open |
| Ghost CTAs on sample detail pages | `/recipes/[slug]`, `/menus/[id]` | **Implemented** |
| Buy ≠ stock (tick vs receive) | `/purchase` | **Implemented** |
| English in Thai UI | `/import`, `/recipes/builder` | **Implemented** |
| Staff kitchen path hidden | `/`, `/today` | **Implemented** |
| Orphan routes | `/costing`, `/activity`, `/recipes/new` | Partially **Implemented** |

---

## Per-screen audit

### `/` — Home

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Staff link not shown | Kitchen can't find `/today` | Show `HomeStaffViewLink` when plan exists | **Implemented** |
| Setup + notifications + hero compete | Too many focal points | Hide badge during setup | Open |
| Hero quantity duplicates next step when ready | Same fact twice | Shorten hint when ready | Open |

---

### `/production`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Status shown 3× | Hero + badges + control | Remove status badge from `ProductionTodayHeader` | **Implemented** |
| *เสร็จแล้ว* deduct unclear | Stock surprise | Helper under status control | **Implemented** |
| Section *เป้าผลิตวันนี้* | Jargon | Rename to *เมนูที่ต้องทำวันนี้* | **Implemented** |
| Edit actions mid-page | Broke content flow | Hero action row | Implemented (V1) |

---

### `/production/edit`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Long AppShell description | Three tasks at once | *เลือกเมนู ใส่จำนวน แล้วบันทึก* | **Implemented** |
| Preview blocks before save | Duplicates post-save view | Collapse into one details | Open |
| *เป้าผลิต (เมนูขาย)* label | Two concepts | *เมนูที่จะทำวันนี้* | Open |

---

### `/purchase`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Description omits receive step | Tick feels complete | Two-step description in AppShell | **Implemented** |
| Receive bar disabled with no hint | Looks broken | Helper when 0 ticked / all ticked | **Implemented** |
| Hero stats duplicate progress | Three counts | Simplify hero stats | Open |

---

### `/today` — Kitchen

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| *รายการสั่งล่วงหน้า* for plan lines | Wrong mental model | *เมนูที่ต้องทำวันนี้* | **Implemented** |
| Empty state passive for staff | No owner action | Hint to notify owner | **Implemented** |
| Not linked from home | Undiscoverable | Home staff link | **Implemented** |

---

### `/recipes`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Two equal create cards | Recipe vs menu intent split | Menu as one-line link | **Implemented** |
| *สูตรตัวอย่าง* unclear | Sample vs own | *สูตรตัวอย่าง (ดูอย่างเดียว)* | **Implemented** |
| Vague description | Browse or create? | *ดูหรือสร้างสูตรอาหาร* | **Implemented** |

---

### `/recipes/builder`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Title *กำลัง...บิ้วเด้อ* | Brand not operational | *สร้างสูตร* | **Implemented** |
| English units | Kitchen Thai | ก., กก., มล., ลิตร, ชิ้น, มัด | **Implemented** |
| *ใช้บ่อย* on every row | Noise | Removed | **Implemented** |
| Category placeholder *เมนูขายดี* | Wrong domain | *จานเดียว, ต้ม/แกง* | **Implemented** |

---

### `/recipes/[slug]` — Sample recipe

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Disabled action bar | Ghost CTAs | Sample footer + link to builder | **Implemented** |
| *บันทึกสูตร* on demo | False save affordance | Hide save (`showSave={false}`) | **Implemented** |
| Batch label *ผลิต* | Sounds like production plan | *ทำกี่เสิร์ฟ* | **Implemented** |
| Jargon in price helper | *เป้าต้นทุน* | Plain Thai helper | **Implemented** |

---

### `/recipes/new` — Stub

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Wrong route/title | Menu under recipes | Redirect to `/menus/new` | **Implemented** |

---

### `/menus`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Create hint lists 3 decisions | Overwhelming | *เลือกสูตรและราคาก่อน* | **Implemented** |
| Sample vs own on cards | Unclear | Example chip on cards | Open |

---

### `/menus/[id]` — Sample menu

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Disabled action bar | Ghost CTAs | Single CTA to create from sample | **Implemented** |
| Cost hidden in details | Profit not visible | One-line profit under price | Open |

---

### `/menus/new` & edit

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| 6-stat bottom bar | Cognitive overload | Show 3 primary metrics | Open |
| *ชุดบรรจุภัณฑ์* jargon | Not daily speech | Friendlier label + optional helper | Open |

---

### `/ingredients`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Overlaps inventory purpose | Two pages, same object | *ดูอย่างเดียว* description | **Implemented** |
| No path to adjust stock | Wrong page for counts | Link to สต๊อก | **Implemented** |

---

### `/inventory`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| *ขั้นต่ำ* label | Non-obvious | *เตือนเมื่อเหลือน้อยกว่า* | **Implemented** |
| Terminology vs nav | สต๊อก vs ของในครัว | Align search group labels | Open |

---

### `/import`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| English sheet names in UI | Dev language | Thai sheet labels | **Implemented** |
| 4 type tiles before upload | Decision before file | Helper text | Open |

---

### `/settings`

| Problem | Reason | Suggested improvement | Status |
|---------|--------|----------------------|--------|
| Many fields feel mandatory | Overwhelm | Intro: fill name + GP first | **Implemented** |
| `/activity` unreachable | Orphan log | Link from settings | **Implemented** |
| Overlap with `/setup` | Two config places | Onboarding vs settings copy | Open |

---

### `/settings/data`, `/setup`, `/search`, `/notifications`

| Screen | Key issue | Status |
|--------|-----------|--------|
| `/settings/data` | Abstract *N ส่วน* on restore | Open |
| `/setup` | Form visible after complete | Open |
| `/search` | Duplicate idle copy | **Implemented** (removed description) |
| `/notifications` | Redundant *ไปดู* footer | **Implemented** |

---

### `/costing`, `/activity`

| Screen | Key issue | Status |
|--------|-----------|--------|
| `/costing` | Orphan demo looks like user's menu | **Implemented** (banner + ตัวอย่าง badge) |
| `/activity` | No nav entry | **Implemented** (settings link) |

---

## Implementation summary (this pass)

**22 obvious copy/layout fixes implemented** across:

- Home, production, purchase, today, recipes (library, builder, detail, stub redirect)
- Menus (library hint, sample action bar)
- Ingredients, inventory labels
- Import Thai copy
- Settings intro + activity link
- Notifications, search, costing

**No business logic, calculations, or data flow changed.**

---

## Recommended V2 follow-up (open items)

| Priority | Item |
|----------|------|
| P1 | Menu builder: reduce 6-stat bottom bar to 3 |
| P1 | Menu detail: always-visible profit line |
| P2 | Purchase hero: simplify duplicate stats |
| P2 | Production edit: collapse preview sections |
| P2 | Setup: hide form after complete |
| P3 | Unify สต๊อก / ของในครัว in search groups |
| P3 | Sample chips on menu/recipe library cards |

---

## Next step

Review implemented changes on device. Confirm **UX Audit V2 follow-up** scope or request adjustments.
