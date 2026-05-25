# Claude Code — start here

You're picking up a design handoff from a separate Claude session that produced HTML prototypes of a redesigned SSC portal. Your job: implement the **Paper** (light) and **Carbon** (dark) themes from those prototypes into this Next.js + Tailwind v4 codebase, on a new branch called `design`.

## What's in this folder

| File | Purpose |
| --- | --- |
| `README.md` | Full handoff spec — read this for the visual direction, design tokens, screen inventory, and behavioral notes. |
| `tokens.css` | Drop-in CSS that defines Paper & Carbon theme tokens via `@theme` + `[data-theme="…"]` selectors. Designed for Tailwind v4. |
| `globals.css` | Full replacement for `src/app/globals.css` — wires Tailwind v4 + tokens.css + base resets. |
| `theme.ts` | TypeScript constants mirroring the same token values, for non-Tailwind access. |
| `ThemeProvider.tsx` | Client component that sets `data-theme` on `<html>` and persists the choice to localStorage. |
| `ThemeToggle.tsx` | Small reference UI for switching Paper ↔ Carbon. |
| `prototype/` | The original HTML/JSX prototype files this handoff is based on. **Reference only — do not ship.** |

## How to apply

1. **Create the branch.**
   ```
   git checkout -b design
   ```

2. **Drop the tokens in.**
   - Replace `src/app/globals.css` with `globals.css` from this folder.
   - Copy `tokens.css` into `src/app/` (or wherever your global styles live — `globals.css` imports it).
   - Copy `theme.ts`, `ThemeProvider.tsx`, `ThemeToggle.tsx` into `src/lib/theme/`.

3. **Wire the provider.**
   - In `src/app/layout.tsx`, wrap `{children}` with `<ThemeProvider>` (it sets `data-theme` on the `<html>` element).

4. **Verify the swap.**
   - Run `bun run dev`. Open any page — the background should be Paper (#f3f2ee). Toggle via the `<ThemeToggle />` to Carbon (#0a0a09).
   - Existing pages will pick up `bg-surface`, `text-ink`, `border-line` etc. once you migrate their utility classes (see "Migrating existing pages" in README.md).

5. **Commit + open a PR back to `main`.** Title it `feat(design): introduce Paper + Carbon themes`.

## Important constraints

- **Visual direction is locked.** The values in `tokens.css` are exact. Don't substitute "close" hex codes or round them.
- **Monochrome by default.** The portal uses an "ink" accent — the default brand color is the foreground text color of the active theme, NOT a saturated brand color. `--color-accent` resolves to `--color-ink` in both themes. Keep it that way unless explicitly told otherwise.
- **No new color tokens without asking.** If a screen needs a color you don't see in `tokens.css`, surface that as a question — don't invent one.
- **Tailwind v4 syntax.** This project uses `@import "tailwindcss"` and the `@theme` directive — no `tailwind.config.ts`. All token definitions live in CSS.
- **The HTML prototypes in `prototype/` are NOT production code.** They use inline styles and React via CDN/Babel. Implement the same visual language using Tailwind utilities and the project's existing component patterns.

## When you're done

Run:
```
bun run lint
bun run typecheck
```
Both should pass cleanly. Then push the `design` branch and open a PR.

If anything in this handoff is ambiguous, ask the user before guessing.
