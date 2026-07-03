# Home Information Hierarchy V2

**Goal:** Home answers **"What should I do today?"** within 3 seconds.

**Scope:** Layout and copy only — no calculation or business-logic changes.

---

## Before

| Layer | Content | Problem |
|-------|---------|---------|
| Setup banner | Shown above hero even when competing | Split attention |
| Hero (`HomeHero`) | Date label + duplicate quantity/status title | Repeated next-step fact |
| Notification badge | Absolute position on hero (`pr-[4.25rem]`) | Visual hack; competes with title |
| Next step (`HomeNextStep`) | White card with "ทำต่อ" + same action | Two cards for one CTA |
| Staff link (`HomeStaffViewLink`) | Third card when plan exists | Extra scroll when ready → `/today` |

**Typical ready state:** 3 cards + badge overlap ≈ 2+ screen scrolls on 390px.

---

## After

| Layer | Content | Role |
|-------|---------|------|
| Setup incomplete | `HomeSetupBanner` only | Single answer: finish setup |
| `HomeHeader` | Date (left) + notification chip (right) | Context + secondary alerts |
| `HomeTodayFocus` | Navy hero: label + action title + hint + chevron | **One** tappable next step |

**Typical ready state:** 2 compact rows — fits above the fold.

---

## Next-step logic (`getHomeNextStep`)

Priority unchanged; destinations tightened:

1. **No plan** → `วางแผนผลิต` → `/production/edit` (skip list hop)
2. **Purchase remaining** → `ไปซื้อของ` → `/purchase`
3. **Stock alerts** → `ดูของที่เหลือ` → `/inventory`
4. **Ready** → `เปิดงานครัววันนี้` → `/today` (replaces separate staff card)

Hints carry context only (counts, remaining items) — titles are the action.

---

## Files

| File | Change |
|------|--------|
| `app/home/HomeTodayPage.tsx` | New layout; setup-only vs header+focus |
| `app/home/components/HomeHeader.tsx` | **New** — date + notifications |
| `app/home/components/HomeTodayFocus.tsx` | **New** — merged hero + next step |
| `app/home/utils/getHomeNextStep.ts` | Ready → `/today`; no-plan → `/production/edit` |
| `app/home/copy.ts` | `focusLabel`, `kitchen.*`, `production.createHint` |

**Retained (unused on main page, not deleted):** `HomeHero`, `HomeNextStep`, `HomeStaffViewLink`, summary widgets.

---

## Hierarchy checklist

- [x] Hero answers "what to do" — action is the title, not a status repeat
- [x] One primary card — no duplicate CTA
- [x] Notifications secondary — header chip, not overlapping hero
- [x] Reduced scrolling — removed staff link when kitchen is the action
- [x] Setup path — single banner when incomplete

---

## Test plan

1. **Setup incomplete** — only setup banner; no hero/header
2. **No plan** — focus shows "วางแผนผลิต" → taps to `/production/edit`
3. **Plan + purchase left** — "ไปซื้อของ" + remaining count
4. **Plan + stock alerts** — "ดูของที่เหลือ" + alert count
5. **Ready** — "เปิดงานครัววันนี้" + dish count → `/today`
6. **Notifications** — chip in header when count > 0; no layout shift on hero
