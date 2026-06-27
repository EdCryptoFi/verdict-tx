# Design — PitchMarket

## Visual direction: "Broadcast Premium + Crypto"
Energy of a premium World Cup TV broadcast (stadium, pitch, motion) with a crypto-native finish
(dark mode, glass, subtle gradients). Fan-first and exciting, but serious and trustworthy — the
on-chain verification moment should feel high-tech, not gambling-y.

**Avoid:** the classic sportsbook/casino look (neon-green clutter, dense odds tables). It reads as
"shady gambling" and undermines our core message of *verifiable trust*.

### Mood
- Live-sports broadcast graphics + stadium-night atmosphere.
- Premium, confident, kinetic. The pitch is alive; data moves.
- The "Settlement Theater" is the hero moment — make on-chain proof feel like a trophy lift.

### Color tokens (dark base)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0E0C` | near-black, faint green undertone |
| `--surface` | `#12181500` + blur | glass cards over the pitch |
| `--pitch` | `#0E5A2E → #0A3D20` | stadium-grass gradient |
| `--accent` | `#22E27A` | primary action / live (vivid pitch-green) |
| `--accent-2` | `#7C5CFF` | crypto/proof highlights (violet) |
| `--gold` | `#FFC53D` | wins, trophies, confetti |
| `--text` | `#EAF2EC` / `--muted #8FA396` | |
| `--danger` | `#FF5C5C` | losses / closing soon |

### Type
- Display/headers: a condensed sporty grotesk (e.g. **Anton** / **Archivo Expanded**) for scores & team names — broadcast feel.
- UI/body: **Inter** / **Geist** for clarity and numbers.
- Numbers (odds, pools, counters): tabular figures, never jump width while ticking.

### Signature surfaces
- **Live Match Pitch** — animated SVG/Canvas pitch; stadium lights; markets as glass cards floating over it; ball/event motion driven by live TxODDS events.
- **Momentum Meter** — live win-probability bar/curve from live odds (broadcast-style).
- **Settlement Theater** — verification animation: the TxODDS Merkle proof "stamps" on-chain, gold confetti for winners, shareable "Verified on-chain ✓" card.
- **Pick'em / Leaderboard** — lighter, playful sub-surface (the one place a bit of arcade energy is welcome) for free predictions, streaks, ranking.

---

## Counters (live, on every predict page)
Counters are the engine of a prediction market — urgency + "the market is alive". Ship all four:

| Counter | Role | Placement | Notes |
|---|---|---|---|
| ⏳ **Betting closes in** (countdown) | FOMO; converts the undecided. The most important one. | Top of each market | Turns `--danger` under 60s; pulse animation |
| 💰 **Pool size** (live ticking) | Traction + real money on the line | Market card | Animate count-up on new bets; tabular figures |
| 👥 **Bettors count** (live) | Social proof ("237 backed this") | Market card | Increments via indexer websocket |
| ⚽ **Match clock + live score** | Keeps fans glued during play | Live Match Pitch header | Driven by TxODDS SSE scores stream |

Implementation notes:
- All live values stream from the **indexer websocket** (pool, bettors, score) so they update without refresh.
- Countdown is client-side from `betting_close_ts` (already on the Market account), reconciled with chain time.
- Use tabular/monospace numerals so ticking digits don't shift layout.
- Respect `prefers-reduced-motion`: keep counters but drop heavy confetti/pulse.

---

## Status
Direction locked: **Broadcast Premium + Crypto** + the four live counters. To be implemented in the
frontend phase (see [ROADMAP.md](ROADMAP.md), Phase 3–4). Build with Tailwind; consider shadcn/ui
for primitives and the `ui-ux-pro-max` skill for component generation.
