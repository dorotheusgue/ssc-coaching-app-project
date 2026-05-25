# Handoff: Paper + Carbon themes for the SSC portal

> **TL;DR** — Two themes (Paper light, Carbon dark) from the design exploration, ready to drop into the Next.js + Tailwind v4 codebase on a new `design` branch. Token values are exact. The brand direction is monochrome ink — no saturated accent.

## Overview

This handoff brings the visual language from the HTML design prototype (the SSC Strength & Conditioning portal redesign) into the actual codebase. Two themes were selected from the exploration:

- **Paper** — light, paper-warm off-white (#f3f2ee), the default.
- **Carbon** — true-dark, near-black (#0a0a09), inverted hairlines.

Both use a strict **ink monochrome** accent — the brand color resolves to the foreground text color of the active theme, not a saturated brand hue. Cards, dividers, and chrome are built from hairline borders on flat surfaces. Square corners throughout (no border-radius). Compact density (small padding, tight rows).

## About the design files

The files in `prototype/` are the **HTML design references** — prototypes showing the intended look, layout, and component vocabulary. They use React via CDN + Babel and inline styles. They are **not production code**. Your job is to recreate them in the Next.js codebase using its existing patterns (React Server Components where appropriate, Tailwind utility classes, the `lucide-react` icon set already on `package.json`).

## Fidelity

**High-fidelity.** Color values, type scales, spacing, and layout are pinned. When implementing, match values exactly — don't substitute "close" hex codes.

## Stack alignment

The target codebase uses:

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4 (CSS-first config — no `tailwind.config.ts`)
- TypeScript
- Geist font (already loaded in `src/app/layout.tsx`)

The handoff is shaped for that stack:

- Tokens are defined via Tailwind v4's `@theme` directive in `tokens.css`.
- Theme switching uses `data-theme` on `<html>` + a Client `ThemeProvider`.
- Typography continues to use Geist for body — although the prototype uses Inter Tight, Geist is close enough that I do **not** recommend changing the font stack unless the user explicitly asks. The `tokens.css` `--font-sans` falls back to system-ui after Inter Tight; the existing Geist setup in `layout.tsx` overrides via the CSS variable that's already wired (`--font-geist-sans`).

## Apply checklist

1. **Branch.** `git checkout -b design`
2. **Drop tokens.**
   - Move `tokens.css` → `src/app/tokens.css`
   - Replace `src/app/globals.css` with the one in this folder (it imports tokens.css).
3. **Drop theme module.**
   - Move `theme.ts`, `ThemeProvider.tsx`, `ThemeToggle.tsx` → `src/lib/theme/`
4. **Wire provider.** In `src/app/layout.tsx`, import `ThemeProvider` from `@/lib/theme/ThemeProvider` and wrap `{children}`. Optionally pre-set `<html data-theme="paper">` on the server to avoid a flash.
5. **Run.** `bun run dev`, then `bun run lint` + `bun run typecheck` should pass clean.
6. **Migrate one page first.** Pick `src/app/coach/dashboard/page.tsx` as the first migration target — it's the highest-leverage screen. Replace the existing dark-styled utility classes (`bg-neutral-900`, `text-white`, `border-neutral-700`, etc.) with the new tokens (see "Migrating existing pages" below).

## Design tokens (full inventory)

| Token | Paper | Carbon | Use |
| --- | --- | --- | --- |
| `--color-bg` | `#f3f2ee` | `#0a0a09` | Page background |
| `--color-surface` | `#ffffff` | `#131312` | Card / cell background |
| `--color-ink` | `#0e0e0d` | `#efece3` | Primary text |
| `--color-mute` | `#88877f` | `#7f7e77` | Secondary text |
| `--color-faint` | `#c3c1b8` | `#393937` | Tertiary text |
| `--color-line` | `rgba(14,14,13,.09)` | `rgba(239,236,227,.10)` | Hairline divider |
| `--color-rule` | `rgba(14,14,13,.20)` | `rgba(239,236,227,.24)` | Heavier rule |
| `--color-hover` | `rgba(14,14,13,.045)` | `rgba(239,236,227,.05)` | Hover wash |
| `--color-chart` | `#0e0e0d` | `#efece3` | Chart stroke / data |
| `--color-chart-mute` | `rgba(14,14,13,.16)` | `rgba(239,236,227,.22)` | Secondary chart line |
| `--color-accent` | `#0e0e0d` | `#efece3` | Brand accent (= ink, monochrome) |

### Typography scale

The prototype settled on **compact density**. Values below are in pixels.

| Role | Compact | Notes |
| --- | --- | --- |
| Display `h1` | 40 | `font-weight: 400`, `letter-spacing: -0.035em`, `line-height: 1` |
| Section `h2` | 22 | `font-weight: 400`, `letter-spacing: -0.025em` |
| Body | 12 | Default running text + UI labels |
| Micro | 9.5 | Eyebrows, metadata, table headers |

All body-sans, sentence-case. **No all-caps + tracked-out micro-labels** — that pattern was explicitly rejected in the design exploration. Mono is used only for tabular data (set counts, time codes, IDs) — and even there, sentence case with `font-variant-numeric: tabular-nums` works without mono if Geist is the family.

### Spacing rhythm

- Cell padding: `14px`
- Cell gap: `10px`
- Table row height: `36px`
- Hairline border width: `1px`
- All radii: `0` (square corners)

## Component vocabulary

Each screen in the prototype is built from a small set of atoms. Recreate these in your component library:

- **Cell** — a `bg-surface` block with a `1px solid border-line` hairline. The base container for every panel.
- **Eyebrow** — small body-sans label, `text-mute`. Replaces the old all-caps mono pattern.
- **Btn** — square button. Heights: `28px` (small) / `36px` (default). Variants: `default` (border, transparent bg), `primary` (ink bg, surface fg), `ghost` (no border, no bg). Always `letter-spacing: -0.005em`.
- **NavTab** — top-bar nav item. Active state is a 1.5px ink underline + ink text.
- **FlagBadge** — fixed-width status pill (`92×22px`), hairline border, body-sans 11px, mark glyph + label.
- **Rule** — `1px` divider (`line` for hairlines, `rule` for stronger separators).
- **Num** — large numeric display, body-sans, `letter-spacing: -0.035em`, tabular-nums.
- **LineChart / CompletionBars / Ring** — hairline charts, no fills, ink stroke.

See `prototype/prototype-core.jsx` for reference implementations.

## Screen inventory

The prototype implements 9 screens across two roles. All are paginated under the existing route structure in the codebase.

| Route | Screen | Reference file |
| --- | --- | --- |
| `/login` | Sign-in | `prototype/prototype-core.jsx → SignIn` |
| `/athlete/today` | Today (active session log) | `prototype/prototype-core.jsx → AthleteToday` |
| `/athlete/calendar` | Athlete calendar | `prototype/prototype-screens.jsx → AthleteCalendar` |
| `/athlete/progress` | Progress / PBs | `prototype/prototype-screens.jsx → AthleteProgress` |
| `/athlete/media` | Media upload | `prototype/prototype-screens-v2.jsx → AthleteMedia` |
| `/athlete/messages` | Messages | `prototype/prototype-screens.jsx → AthleteMessages` |
| `/coach/dashboard` | Coach dashboard | `prototype/prototype-core.jsx → CoachDashboard` |
| `/coach/athletes` | Roster | `prototype/prototype-screens.jsx → CoachAthletes` |
| `/coach/programs` | Programs list | `prototype/prototype-screens.jsx → CoachPrograms` |
| `/coach/programs/[id]` | Program builder | `prototype/prototype-screens.jsx → CoachProgramBuilder` |
| `/coach/exercises` | Exercise library | `prototype/prototype-screens-v2.jsx → CoachExercises` |
| `/coach/media` | Media review | `prototype/prototype-screens-v2.jsx → CoachMediaGallery` |
| `/coach/calendar` | Coach calendar | `prototype/prototype-screens.jsx → CoachCalendar` |
| `/coach/messages` | Messages | `prototype/prototype-screens.jsx → CoachMessages` |

Each component has detailed layout in its reference file — read it before implementing.

## Migrating existing pages

The repo currently uses Tailwind utility classes against neutral palette tokens (`bg-neutral-800`, `text-neutral-400`, `border-neutral-700`). After this handoff, those become:

| Old | New |
| --- | --- |
| `bg-neutral-900` / `bg-black` | `bg-bg` |
| `bg-neutral-800` | `bg-surface` |
| `text-white` / `text-neutral-200` | `text-ink` |
| `text-neutral-400` / `text-neutral-500` | `text-mute` |
| `text-neutral-600` | `text-faint` |
| `border-neutral-700` | `border-line` |
| `border-neutral-600` | `border-rule` |
| `hover:bg-neutral-700` | `hover:bg-hover` |
| `text-emerald-400` (existing accent) | `text-accent` |
| `bg-emerald-500` | `bg-accent` |
| `rounded-lg` / `rounded-xl` | (delete — square corners) |

Do this migration page-by-page. Don't try to do it in one sweep — eyeball each screen against the prototype to make sure the spacing rhythm matches.

## Behavior & interactions

- **Theme switching** — `ThemeToggle` lives in the top-right of the nav for both Athlete and Coach roles (next to the user avatar). Persists via `localStorage["ssc-theme"]`.
- **Density / accent / font** — the prototype exposes these as runtime tweaks for design exploration. **Do not port** these to production — they were exploratory. The locked direction is: compact density, ink accent, Inter Tight body (falling back to Geist via the existing layout.tsx setup).
- **Animations** — minimal. `transition-colors .12s` for hover states. No spring physics, no fades, no slide-ins. Page transitions stay native to Next.js.

## State management

Theme state is the only new global state introduced. It lives in `ThemeProvider` (React context + localStorage). Everything else continues to use the codebase's existing patterns (Server Components for data, server actions for mutations).

## Assets

No new assets required. The brand mark is an inline SVG square-S, drawn in `prototype/prototype-core.jsx → BrandMark`. Icons continue to come from `lucide-react` (already a dependency).

## Files

| Path | Status |
| --- | --- |
| `CLAUDE.md` | Read this first |
| `README.md` | This file — full spec |
| `tokens.css` | Drop into `src/app/tokens.css` |
| `globals.css` | Replace `src/app/globals.css` |
| `theme.ts` | Into `src/lib/theme/theme.ts` |
| `ThemeProvider.tsx` | Into `src/lib/theme/ThemeProvider.tsx` |
| `ThemeToggle.tsx` | Into `src/lib/theme/ThemeToggle.tsx` |
| `prototype/SSC Portal Design.html` | Reference — open in a browser to see the full prototype |
| `prototype/prototype-core.jsx` | Reference — theme defs, atoms, charts, 3 screens |
| `prototype/prototype-screens.jsx` | Reference — 8 more screens + the Prototype shell |
| `prototype/prototype-screens-v2.jsx` | Reference — Exercise library + Media screens |
| `prototype/design-canvas.jsx` | Support — canvas wrapper for the prototype |
| `prototype/tweaks-panel.jsx` | Support — exploratory tweak panel (do not port) |

## Questions to surface before implementing

If any of these come up while implementing, **ask the user** rather than guess:

1. **Font family.** The prototype uses Inter Tight. The codebase ships Geist. Stay on Geist unless told otherwise — it's already wired and visually close. If the user wants a strict match, swap to `next/font/google → Inter_Tight` in `layout.tsx`.
2. **Default theme.** Paper is currently the default. If the user wants Carbon by default, change `DEFAULT_THEME` in `theme.ts` AND the initial server-side `data-theme` attribute in `layout.tsx`.
3. **Bone theme.** The original exploration also had a "Bone" theme (warm bone-white). It was not selected. If a third theme is later requested, the prototype's `PROTO_THEMES.bone` has the values.
4. **Media handling.** The Athlete/Coach Media screens depend on the existing `/api/upload` route. Verify that route handles the prototype's drag-drop UX before implementing.

When in doubt, ask. Don't ship a guess.
