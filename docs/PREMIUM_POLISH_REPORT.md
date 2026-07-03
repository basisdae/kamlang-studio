# Premium Polish Report

**Goal:** Final premium consumer-app feel — typography, micro spacing, rhythm, accents, icons, motion — **without changing layouts**.

**Scope:** Design tokens and global styles only. No route structure, component tree, or business logic changes.

---

## Approach

All polish flows through `app/globals.css` tokens and shared UI primitives. Screens inherit automatically.

---

## Motion system (new tokens)

| Token | Value | Use |
|-------|-------|-----|
| `--kl-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Surfaces, color, shadow |
| `--kl-ease-spring` | `cubic-bezier(0.34, 1.08, 0.64, 1)` | Press / scale feedback |
| `--kl-duration-fast` | 180ms | Taps, icons |
| `--kl-duration-base` | 240ms | Buttons, nav, inputs |
| `--kl-duration-slow` | 360ms | Progress bars |
| `--kl-transition-press` | transform + opacity | `.kl-pressable`, `.kl-tap-link` |
| `--kl-transition-surface` | bg, color, shadow, border | Buttons, nav, inputs |

**Reduced motion:** `prefers-reduced-motion` disables transforms/transitions on interactive elements.

---

## Typography

- Body: `text-rendering: optimizeLegibility`, `font-feature-settings: kern, liga`
- Section titles: slightly wider letter-spacing (`0.055em`)
- Buttons: `font-weight: 600`, subtle `letter-spacing`
- Hero label: `0.06em` tracking; title/subtitle rhythm tightened (`0.5rem` gaps)
- Stat labels: `0.02em` tracking; value gap `mt-1` (was `mt-1.5`)

---

## Shadows & surfaces

- **Softer layered shadows** on cards, nav, soft elements
- **Subtle card border** (`--kl-border-subtle`) — crisp on ivory without harsh edges
- **Focus ring** on inputs: `box-shadow: var(--kl-shadow-focus)` (no layout shift)
- **Sheet scrim:** lighter overlay + `backdrop-filter: blur(6px)`

---

## Accent & color rhythm

- **Section title bar:** champagne → navy gradient (was flat gray)
- **Hero:** refined gradient + warm radial highlight (`::before`)
- **Nav active:** stronger pill (`--kl-nav-active-strong`) + **600** label weight
- **Notification chip:** burgundy depth shadow
- **Icon wells:** inset highlight for tactile depth

---

## Icon placement

- `display: block` on SVGs in buttons, nav, icon buttons, search — removes baseline wobble
- Button icon gap: `0.625rem` (optical balance)
- Search bar: tighter icon–input gap; icon color via `.kl-search svg`

---

## Animation timing

| Element | Before | After |
|---------|--------|-------|
| Pressable | `200ms ease`, scale 0.98 | Spring ease, scale 0.985 |
| Buttons / nav | mixed 180–220ms ease | unified tokens |
| Progress fill | 220ms ease | 360ms ease-out |
| Skeleton shimmer | 1.4s ease-in-out | 1.75s custom ease |

---

## Components touched

| File | Change |
|------|--------|
| `app/globals.css` | Tokens + all polish above |
| `components/ui/Badge.tsx` | `.kl-badge` utility |
| `components/ui/SearchBar.tsx` | Icon styling via CSS |
| `components/ui/StatCell.tsx` | Tighter label→value rhythm |

---

## Not changed (by design)

- AppShell spacing (`space-y-4` / `space-y-7`)
- Page structure, grids, action bar positions
- Color palette hues (navy, ivory, burgundy, champagne)
- No new animations on page enter — polish stays calm

---

## Test plan

1. **Home hero** — warm highlight, label tracking, press on focus card
2. **Nav** — active tab weight + pill; press spring on tabs
3. **Forms** — input focus ring (no jump)
4. **Sheets** — blurred scrim behind bottom sheets
5. **Badges / stats** — tighter, more confident type
6. **Accessibility** — enable reduced motion; taps should not scale
