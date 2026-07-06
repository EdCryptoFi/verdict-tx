# Frontend editing guide — Verdict

## Run it (live-reload)
```bash
pnpm --filter @verdict/app dev        # → http://localhost:3000
```
Optional (live counters from the indexer; the app also works standalone with demo data):
```bash
TXODDS_MOCK=1 pnpm --filter @verdict/indexer start   # ws://localhost:8787
```
Edit any file under `app/src/**` and the browser hot-reloads. No wallet/backend needed to design —
the page renders demo markets out of the box.

## Where the visuals live

| What you want to change | File |
|---|---|
| **Colors, fonts, gradients, glass, pitch** (design tokens) | `app/src/app/globals.css` (`@theme { --color-* }`) |
| **Page layout, header, grid, demo data** | `app/src/app/page.tsx` |
| **The market card** (score header, momentum bar, odds, counters) | `app/src/components/MarketCard.tsx` |
| **Countdown pill** | `app/src/components/Countdown.tsx` |
| **Bet / claim box** (outcome buttons, amount input) | `app/src/components/BetBox.tsx` |
| **Page title / metadata** | `app/src/app/layout.tsx` |

## Design tokens (edit these first)
All colors are CSS variables in `globals.css` — change them once and the whole app follows:
```
--color-bg        near-black background
--color-accent    pitch-green (primary action / live)     #22e27a
--color-accent-2  violet (crypto / proof highlights)      #7c5cff
--color-gold      wins / trophies                         #ffc53d
--color-danger    losses / closing soon                   #ff5c5c
--color-text / --color-muted   text colors
--color-pitch-from / --color-pitch-to   stadium-grass gradient
```
Use them in JSX as `style={{ color: "var(--color-accent)" }}` or Tailwind arbitrary values
`text-[var(--color-accent)]`. Utility classes `.glass`, `.pitch`, `.tnum` are also in `globals.css`.

Full design intent (style direction, the 4 counters, Settlement Theater) is in `docs/DESIGN.md`.

## Notes
- Styling is **Tailwind v4** (`@import "tailwindcss"` + `@theme`) — no `tailwind.config.js`; tokens live in CSS.
- Components are client components (`"use client"`). Keep time/random values behind a mounted check
  (see `Countdown.tsx`) to avoid hydration warnings.
- Demo markets are hardcoded in `page.tsx` (`DEMO`); when the indexer is running they're replaced by
  the live feed. Safe to restyle freely — logic (bet/claim) lives in `lib/` and `BetBox.tsx`.
