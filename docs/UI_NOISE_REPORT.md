# UI Noise Reduction Report

**Audit date:** July 2026  
**Lens:** Tired restaurant owner, mobile 390px — less clutter, same features  
**Rules:** No feature or business logic changes — copy, layout, and visual hierarchy only

---

## Principles applied

1. **One explanation per screen** — remove AppShell descriptions that repeat inline captions or section titles  
2. **No duplicate facts** — hero stats must not repeat title/subtitle or controls below  
3. **Whitespace over decoration** — drop wrapper cards, badges, and emphasis blocks when content is obvious  
4. **Compact workflows** — `compact` AppShell + `space-y-4` on dense list/builder/detail routes  
5. **Right-sized actions** — text links and `size="sm"` buttons for secondary/frequent actions

---

## Changes by route

### `/setup`
| Removed | Why |
|---------|-----|
| AppShell description | Redundant with page title |
| Intro Card before form | Duplicated `SetupForm` section header |
| Form helper under `"ข้อมูลร้าน"` | Third setup explanation |
| GP field caption | Kept on `/settings` only |
| Edit-hint Card after complete | Form below is self-evident |
| FullWidth secondary `"กลับหน้าแรก"` | Text link instead |

### `/import`
| Removed | Why |
|---------|-----|
| AppShell description | Duplicated save-area caption |
| Card wrapper around save button | Unnecessary chrome |
| `"ไฟล์ผ่านการตรวจสอบ"` next to badge | Badge alone is enough |
| Success summary refresh caption | Page already shows reload message |
| Long sample-data disclaimer | Shortened to `"ไม่แตะข้อมูลตัวอย่าง"` |

### `/settings` & `/settings/data`
| Removed | Why |
|---------|-----|
| AppShell descriptions | Duplicated card/link copy |
| Onboarding intro Card | Settings form is self-explanatory |
| Captions on link cards | Title + link is enough |
| Export card caption + long button label | Button `"ดาวน์โหลด"` |
| Undo refresh paragraph | Undo toast handles this |

### `/production`
| Removed | Why |
|---------|-----|
| AppShell description | Hero + sections carry context |
| `ProductionTodayHeader` badge | Duplicated `ProductionDeductedBanner` |
| Status stat in hero | Duplicated status control below |
| Card/Badge on deduct message | Inline caption |
| Inner `space-y-7` | `space-y-4` + `compact` |
| Status control long helper | Shortened to one line |

### `/production/edit`
| Removed | Why |
|---------|-----|
| Scroll-area cost/ingredient/packaging previews | Duplicated fixed bottom summary |
| `space-y-7` | `space-y-4` + `compact` |

### `/purchase`
| Removed | Why |
|---------|-----|
| AppShell description | `PurchaseReceiveBar` explains flow |
| Duplicate date in list header | Link `"ดูแผนผลิต"` only |
| Extra hero stats (`รายการ`) | Title already shows X/Y |
| `space-y-7` | `space-y-4` + `compact` |

### `/today`
| Removed | Why |
|---------|-----|
| AppShell description | Sections are dated |
| Hero stats row | Duplicated title fraction |
| Packaging empty state | Section already hides when empty |
| `space-y-7` | `space-y-4` + `compact` |

### `/menus`, `/menus/[id]`, `/menus/new`, `/menus/[id]/edit`
| Removed | Why |
|---------|-----|
| List AppShell description | Title is enough |
| CTA helper text on list | Obvious from destination |
| Hero name/category on detail | AppShell title carries it |
| Recipe link category line | Name only in context |
| Builder descriptions | Field labels sufficient |
| `space-y-7` on builders | `space-y-4` + `compact` |

### `/recipes`, `/recipes/[slug]`, `/recipes/builder`
| Removed | Why |
|---------|-----|
| List description + CTA helper | Noise on primary action |
| Cross-link to menus | Promo clutter on list |
| Hero name/category | AppShell title carries it |
| Total-time helper under stats | Prep/cook already shown |
| Cost summary GP helper | Obvious from stats |
| Sample footer Card + warning text | CTA only |
| Builder description | Bottom bar shows cost |
| FullWidth `"เพิ่มวัตถุดิบ"` | `size="sm"` compact button |

### `/ingredients`
| Removed | Why |
|---------|-----|
| Stock emphasis block + status badge | Catalog is price-focused; stock lives on `/inventory` |
| Inventory cross-link | Nav covers this |
| `(ดูอย่างเดียว)` in description | Shortened description |

### `/inventory`
| Removed | Why |
|---------|-----|
| AppShell description | Filters explain state |
| Hero low/out stat row | Duplicated filter chips |
| Per-card threshold text | Shown in adjust sheet |
| `kl-card-emphasis` stock block | Inline quantity row |
| `compact` spacing | Denser list |

### `/search`
| Removed | Why |
|---------|-----|
| AppShell title row | Search bar is the focal point; back-only header |
| Idle empty state long copy | Shorter title + hint |
| `space-y-7` between groups | `space-y-4` |

### `/costing`
| Removed | Why |
|---------|-----|
| AppShell description | Page content is self-evident |
| Second sample disclaimer line | One line banner |
| `"เมนูที่เลือก"` label + badge | Name only |
| Long food-cost paragraph | `"เป้า 30–35%"` |

### `/`, home components
| Removed | Why |
|---------|-----|
| Setup banner helper | Title + button enough |
| Staff view link helper | Link label is clear |

### `/notifications`, `/activity`
| Removed | Why |
|---------|-----|
| AppShell descriptions | Vague; titles sufficient |

---

## Infrastructure

| Change | File |
|--------|------|
| Back button when `hidePageHeader` + `backHref` | `components/layout/AppShell.tsx` |

---

## Open (low priority)

| Item | Notes |
|------|-------|
| `SavedRecipeLibraryCard` dual fullWidth actions | Could compact to row icons |
| `ActivityTimeline` Card per row | Could flatten to border list |
| `SearchResultGroup` Card per hit | Could use list rows |
| `MenuBuilderSummary` 6 bottom stats | Could show 3 + expand |
| `ProductionBuilderForm` split Cards | Could merge date + lines |
| Home hero vs next-step duplicate hint | Context-dependent; needs care |

---

## Verification

- `npm run build` — **passes**
- No calculation, pricing, or routing logic changed
- No commits made

---

## Review checklist

1. `/production` — one `"หักของแล้ว"`, status only in control  
2. `/production/edit` — preview only in bottom bar  
3. `/purchase` — no triple date/count display  
4. `/menus/[id]` — title once (header), hero shows price  
5. `/recipes/[slug]` — sample footer is one button  
6. `/search` — back + search bar, no double `"ค้นหา"` heading  
7. `/ingredients` vs `/inventory` — catalog vs stock clearly separated  
8. Builders — tighter vertical rhythm, smaller add-ingredient button  

---

*Stopped for review.*
