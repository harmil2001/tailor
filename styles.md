# Dhaaga — Design System

**Mobile-first always.** This app is used by the tailor from his phone during shop hours. Every screen must be designed for ~390px width first. No horizontal scrolling. Generous touch targets (min 48px). Desktop is a bonus, not the goal.

---

## Fonts

Loaded via `next/font/google` in `src/app/layout.tsx`:
- **Manrope** — all headlines (600, 700, 800 weight) → CSS var `--font-manrope`
- **Poppins** — all body text, labels, buttons (400, 500, 600, 700 weight) → CSS var `--font-poppins`
- **Material Symbols Outlined** — all icons (loaded via `<link>` in layout head)

---

## Type Scale

| Token | Font | Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|---|
| `headline-lg` | Manrope | 28px | 36px | 700 | -0.02em |
| `headline-md` | Manrope | 22px | 28px | 600 | -0.01em |
| `headline-sm` | Manrope | 18px | 24px | 600 | — |
| `body-lg` | Poppins | 16px | 24px | 400 | — |
| `body-md` | Poppins | 14px | 20px | 400 | — |
| `label-md` | Poppins | 12px | 16px | 600 | 0.05em |
| `label-sm` | Poppins | 11px | 14px | 500 | — |

---

## Color Palette

Theme: **Dhaaga — soft slate**. Light mode only. Low-saturation colours chosen to be easy on the eyes over a full working day.

Every colour is a token defined once in `src/app/globals.css` (`@theme static`). Each shop can override any token in its settings file (`src/config/shops/<shop-id>.ts`, see the README); the PDF invoice and QR labels read the resolved colours from `src/config/theme.ts`. Use the Tailwind utility (`bg-brand`, `text-ink`, `border-line` …) or `var(--color-…)` in inline styles. **Never hard-code a hex value in a component.** The only exception is `src/lib/generateOrderPDF.ts`, which mirrors the palette because jsPDF needs literal colours.

| Token | Hex | Usage |
|---|---|---|
| `canvas` | `#f6f6f4` | Page background, top bar |
| `surface-muted` | `#efeeea` | Quiet fills, progress tracks |
| `line` | `#dddcd6` | Borders, dividers, input borders |
| `ink` | `#2f3850` | Primary text |
| `ink-soft` | `#666b77` | Secondary text |
| `ink-muted` | `#7b7f89` | Icons, hints, inactive nav |
| `brand` | `#3f4a63` | Buttons, active states, dark panels |
| `brand-deep` | `#343e55` | Gradient end on dark panels |
| `brand-tint` | `#e6e9f0` | Active nav pill, tinted cards |
| `accent` | `#8c7242` | FAB, small accents |
| `accent-soft` | `#c9ae7c` | Logo needle, PDF rules |
| `accent-tint` | `#f1e9d8` | Icon chips, Stitching badge |
| `danger` | `#a8443d` | Errors, balance due |
| `success` | `#3f6b54` | Paid, in stock |

Each family also has `-wash`, `-tint`, `-tint-strong` and `-ink` steps where needed; see `globals.css` for the full list.

### Status badges
| Status | Background | Text |
|---|---|---|
| Pending | `danger-tint` | `danger-ink` |
| Stitching | `accent-tint` | `accent-ink` |
| Ready | `info-tint` | `info-ink` |
| Delivered | `success-tint` | `success` |
| Cancelled | `neutral-tint` | `ink-soft` |

### Brand
The shop name, tagline and logo type come from the shop's settings file (`src/config/shops/<shop-id>.ts`); the logo mark is drawn by `src/components/ui/BrandLogo.tsx`.

---

## Spacing & Layout

| Token | Value | Usage |
|---|---|---|
| `container-padding` | `1rem` (16px) | Horizontal page padding |
| `stack-gap` | `0.75rem` (12px) | Vertical spacing between stacked items |
| `touch-target` | `3rem` (48px) | Minimum tap/click area |
| `header-height` | `56px` | Fixed top bar |
| `nav-bar-height` | `72px` | Fixed bottom nav |

**Page padding rule:** Always add `pt-[56px] pb-[72px]` to `<main>` to account for fixed header and bottom nav.

---

## Border Radius

| Token | Value | Usage |
|---|---|---|
| `DEFAULT` | `0.25rem` | — |
| `lg` | `0.5rem` | Buttons |
| `xl` | `0.75rem` | Inputs, search bar |
| `full` | `9999px` | Pills, tabs, FAB, nav icons |
| `[24px]` | `24px` | Order/customer cards |

---

## Components

### Top App Bar
- Fixed, `z-50`, height `56px`
- Background: `surface` with bottom border `outline-variant`
- Left: circular avatar (32px) + app name in `headline-md` Manrope bold
- Right: settings icon button (rounded-full, 40px touch target)

### Bottom Navigation Bar
- Fixed bottom, `z-50`, height `72px`
- Background: `surface/80` + `backdrop-blur-md` (frosted glass)
- Top border: `outline-variant`
- 4 tabs: **Home · Customers · Orders · Marketing**
- Icons: Material Symbols Outlined — `home`, `group`, `description`, `campaign`
- Active tab: `secondary` color (`#775a19`), filled icon variant
- Inactive: `on-surface-variant`, outlined icon

### FAB (Floating Action Button)
- Fixed `bottom-24 right-6` (sits above bottom nav)
- Size: `56px × 56px`, `rounded-full`
- Background: `secondary` (`#775a19`), icon: white `add`
- Shadow: `shadow-lg`
- Active: `scale-90` on press

### Order / Customer Cards
- Background: `surface-container-lowest` (white)
- Border: `outline-variant`, `rounded-[24px]`
- Shadow: `0px 4px 12px rgba(15,23,42,0.05)`
- Hover shadow: `0px 10px 25px rgba(15,23,42,0.1)`
- Active: `scale-[0.98]`
- Padding: `p-5`

### Status Badge (Pill)
- `rounded-full`, `px-3 py-1`
- Font: `label-md` (12px, bold, 0.05em spacing)
- Colors: see Semantic / Badge Colors table above

### Search Bar
- Height: `48px`, `rounded-xl`
- Background: `surface-container-lowest`
- Border: `outline-variant`, focus: `primary`
- Left icon: `search` (Material Symbol)
- Font: `body-md`

### Status Filter Tabs
- Horizontal scroll, no scrollbar visible (`hide-scrollbar`)
- Pill shape: `rounded-full`, `px-5 py-2.5`
- Active: `bg-primary text-white shadow-md`
- Inactive: `bg-surface-container-high text-on-surface-variant`
- Font: `label-md`

### Buttons
- Primary: `bg-primary text-white rounded-lg px-4 py-2 font-label-md`
- Hover: `bg-primary-container`
- Always include `active:scale-95 transition-all`

### Inputs
- `rounded-xl`, border `outline-variant`, focus `primary`
- Height min `48px` for touch friendliness

---

## Icons

Use **Material Symbols Outlined**. Common icons used in this app:

| Icon name | Usage |
|---|---|
| `home` | Home nav |
| `group` | Customers nav |
| `description` | Orders nav |
| `campaign` | Marketing nav |
| `settings` | Top bar |
| `add` | FAB |
| `search` | Search bar |
| `calendar_today` | Delivery date |
| `apparel` | Clothing item |
| `content_cut` | Cutting status |
| `check_circle` | Ready status |
| `straighten` | Measurements |

Default icon style:
```css
font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
```
Filled variant (active states): `"FILL" 1`

---

## Mobile-First Rules

1. Design at `390px` width first — no exceptions
2. No horizontal scrolling on any screen (except intentional carousels/tab strips)
3. All tap targets minimum `48px` tall
4. Bottom nav is always visible — never cover it with content
5. FAB sits at `bottom-24` to clear the nav bar
6. Use `pb-24` on scrollable lists so last item isn't hidden behind nav
7. Inputs and buttons use `w-full` on mobile, constrained on larger screens
8. Font sizes are already mobile-optimized — do not reduce them further
9. Cards are full-width on mobile (`grid-cols-1`), multi-col only on `md:` and above
