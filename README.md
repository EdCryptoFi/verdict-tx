# PitchMarket — Verifiable World Cup Prediction Markets on Solana

> TxODDS World Cup Hackathon · **Prediction Markets & Settlement** track ($18k)

Prediction markets on World Cup matches where **settlement is cryptographically verifiable**:
TxODDS signs the final match result, the signed result is posted on-chain, and the Solana
program **verifies the ed25519 signature** before any market resolves. No trusted admin can
settle a market with fake data — not even us.

## The differentiator
- **Verifiable settlement** — on-chain ed25519 proof of the TxODDS-signed outcome (not a trusted "admin resolve" button).
- **Live Match Pitch** — the markets UI is an animated football pitch reacting to live TxODDS events.
- **Momentum Meter** — real-time win-probability curve derived from live odds.
- **Settlement Theater** — the moment of on-chain verification is the visual climax.
- **Pick'em layer** — free social predictions, streaks & leaderboard for frictionless fan onboarding.

## Monorepo layout
| Dir | What |
|---|---|
| `programs/` | Anchor program — pari-mutuel markets, ed25519-verified resolve, claims |
| `app/` | Next.js frontend + Solana wallet adapter (the Live Match Pitch UI) |
| `relayer/` | Oracle relayer — ingests TxODDS API, signs results, calls `resolve` on-chain |
| `indexer/` | Caches odds/matches, serves live updates (websocket) to the app |
| `shared/` | Shared TS types, IDL, signing helpers |
| `docs/` | Architecture, design notes, demo script |
| `scripts/` | Deploy / devnet helpers |

## Stack
- **On-chain:** Rust + Anchor, USDC (SPL), pari-mutuel pools, ed25519 sig verification via the Ed25519 sysvar program.
- **Frontend:** Next.js, `@solana/wallet-adapter`, Canvas/SVG (optional react-three-fiber) for the pitch.
- **Off-chain:** Node/TS relayer + indexer consuming the TxODDS live football API.
- **Network:** Solana devnet (mainnet-beta for final demo if time permits).

## Status
🚧 Hackathon build — 24 Jun → 19 Jul 2026. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/ROADMAP.md](docs/ROADMAP.md).
